import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.join(__dirname, "../../logs");

const isDevelopment = process.env.NODE_ENV !== "production";

const colors = {
	reset: "\x1b[0m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	cyan: "\x1b[36m",
	gray: "\x1b[90m",
};

const getStatusColor = (status: number): string => {
	if (status >= 500) return colors.red;
	if (status >= 400) return colors.yellow;
	if (status >= 300) return colors.cyan;
	if (status >= 200) return colors.green;
	return colors.gray;
};

interface LogMeta {
	method?: string;
	url?: string;
	statusCode?: number;
	responseTime?: number;
	ip?: string;
}

const customFormat = winston.format.combine(
	winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
	winston.format.printf((info) => {
		const meta = info.meta as LogMeta | undefined;
		if (meta) {
			const { method, url, statusCode, responseTime, ip } = meta;
			const status = statusCode || 0;
			const statusColor = getStatusColor(status);

			if (isDevelopment) {
				return (
					`${colors.gray}[${info.timestamp}]${colors.reset} ` +
					`${colors.blue}${method}${colors.reset} ` +
					`${colors.cyan}${url}${colors.reset} ` +
					`${statusColor}${status}${colors.reset} ` +
					`${colors.gray}${responseTime}ms - ${ip}${colors.reset}`
				);
			} else {
				return `[${info.timestamp}] ${method} ${url} ${status} ${responseTime}ms - ${ip}`;
			}
		}

		return `${colors.gray}[${info.timestamp}]${colors.reset} ${info.message}`;
	})
);

const transports: winston.transport[] = [
	new winston.transports.Console({
		level: isDevelopment ? "debug" : "info",
	}),
];

if (isDevelopment) {
	transports.push(
		new winston.transports.File({
			filename: path.join(logsDir, "error.log"),
			level: "error",
			format: winston.format.combine(
				winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
				winston.format.json()
			),
		}),
		new winston.transports.File({
			filename: path.join(logsDir, "combined.log"),
			format: winston.format.combine(
				winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
				winston.format.json()
			),
		})
	);
}

const logger = winston.createLogger({
	format: customFormat,
	transports,
});

export default logger;
