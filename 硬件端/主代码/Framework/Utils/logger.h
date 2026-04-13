
#ifndef __LOGGER_H
#define __LOGGER_H

#include "stm32f10x.h"
#include "sys_config.h"

typedef enum {
    LOG_LEVEL_DEBUG = 0,
    LOG_LEVEL_INFO,
    LOG_LEVEL_WARN,
    LOG_LEVEL_ERROR,
    LOG_LEVEL_NONE
} log_level_t;

#define LOG_LEVEL_CURRENT LOG_LEVEL_DEBUG

void log_init(void);
void log_set_level(log_level_t level);
void log_debug(const char *tag, const char *fmt, ...);
void log_info(const char *tag, const char *fmt, ...);
void log_warn(const char *tag, const char *fmt, ...);
void log_error(const char *tag, const char *fmt, ...);
void log_hexdump(const char *tag, const uint8_t *data, uint16_t len);

#define LOG_TAG_SYS "SYS"
#define LOG_TAG_WIFI "WIFI"
#define LOG_TAG_DATA "DATA"
#define LOG_TAG_PROTO "PROTO"
#define LOG_TAG_TASK "TASK"

#endif

