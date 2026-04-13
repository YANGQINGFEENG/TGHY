
#include "logger.h"
#include &lt;stdio.h&gt;
#include &lt;stdarg.h&gt;
#include &lt;string.h&gt;
#include "usart.h"

static log_level_t g_log_level = LOG_LEVEL_DEBUG;

void log_init(void)
{
    g_log_level = LOG_LEVEL_CURRENT;
}

void log_set_level(log_level_t level)
{
    g_log_level = level;
}

static const char *level_strings[] = {"DEBUG", "INFO", "WARN", "ERROR"};

static void log_print(log_level_t level, const char *tag, const char *fmt, va_list args)
{
    if (level &lt; g_log_level) {
        return;
    }
    
    char buffer[256];
    int offset = 0;
    
    offset += snprintf(buffer + offset, sizeof(buffer) - offset, 
                      "[%s][%s] ", level_strings[level], tag);
    
    vsnprintf(buffer + offset, sizeof(buffer) - offset, fmt, args);
    
    printf("%s\r\n", buffer);
}

void log_debug(const char *tag, const char *fmt, ...)
{
    va_list args;
    va_start(args, fmt);
    log_print(LOG_LEVEL_DEBUG, tag, fmt, args);
    va_end(args);
}

void log_info(const char *tag, const char *fmt, ...)
{
    va_list args;
    va_start(args, fmt);
    log_print(LOG_LEVEL_INFO, tag, fmt, args);
    va_end(args);
}

void log_warn(const char *tag, const char *fmt, ...)
{
    va_list args;
    va_start(args, fmt);
    log_print(LOG_LEVEL_WARN, tag, fmt, args);
    va_end(args);
}

void log_error(const char *tag, const char *fmt, ...)
{
    va_list args;
    va_start(args, fmt);
    log_print(LOG_LEVEL_ERROR, tag, fmt, args);
    va_end(args);
}

void log_hexdump(const char *tag, const uint8_t *data, uint16_t len)
{
    if (g_log_level &gt; LOG_LEVEL_DEBUG) {
        return;
    }
    
    char buffer[64];
    int offset;
    
    printf("[DEBUG][%s] Hexdump (%d bytes):\r\n", tag, len);
    
    for (uint16_t i = 0; i &lt; len; i += 16) {
        offset = 0;
        offset += snprintf(buffer + offset, sizeof(buffer) - offset, "%04X: ", i);
        
        for (uint8_t j = 0; j &lt; 16 &amp;&amp; (i + j) &lt; len; j++) {
            offset += snprintf(buffer + offset, sizeof(buffer) - offset, 
                              "%02X ", data[i + j]);
        }
        
        printf("%s\r\n", buffer);
    }
}

