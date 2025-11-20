import log from 'electron-log';

export const logger = log.scope('streaman');

export function setupLogger() {
  logger.transports.console.level = 'info';
  logger.transports.file.level = 'info';
}
