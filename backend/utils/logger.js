const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logDir = path.join(__dirname, '../logs');
        this.ensureLogDir();
    }

    ensureLogDir() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    formatMessage(level, message, meta = {}) {
        return JSON.stringify({
            timestamp: new Date().toISOString(),
            level,
            message,
            ...meta
        }) + '\n';
    }

    writeToFile(filename, content) {
        const filePath = path.join(this.logDir, filename);
        fs.appendFileSync(filePath, content);
    }

    info(message, meta = {}) {
        const logMessage = this.formatMessage('INFO', message, meta);
        console.log(logMessage.trim());
        this.writeToFile('info.log', logMessage);
    }

    error(message, meta = {}) {
        const logMessage = this.formatMessage('ERROR', message, meta);
        console.error(logMessage.trim());
        this.writeToFile('error.log', logMessage);
    }

    warn(message, meta = {}) {
        const logMessage = this.formatMessage('WARN', message, meta);
        console.warn(logMessage.trim());
        this.writeToFile('warn.log', logMessage);
    }

    audit(action, userId, details = {}) {
        const logMessage = this.formatMessage('AUDIT', action, {
            userId,
            ...details
        });
        this.writeToFile('audit.log', logMessage);
    }
}

module.exports = new Logger();