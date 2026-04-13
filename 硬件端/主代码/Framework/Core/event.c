
#include "event.h"
#include &lt;string.h&gt;
#include "Delay.h"

static event_t g_event_queue[MAX_EVENT_QUEUE_SIZE];
static volatile uint8_t g_event_head = 0;
static volatile uint8_t g_event_tail = 0;

static event_listener_t g_listeners[MAX_EVENT_QUEUE_SIZE];
static uint8_t g_listener_count = 0;

static task_t g_tasks[MAX_TASK_COUNT];
static uint8_t g_task_count = 0;

static volatile uint32_t g_system_tick = 0;

void event_init(void)
{
    g_event_head = 0;
    g_event_tail = 0;
    g_listener_count = 0;
    memset(g_event_queue, 0, sizeof(g_event_queue));
    memset(g_listeners, 0, sizeof(g_listeners));
}

sys_status_t event_post(event_type_t type, void *data, uint16_t len)
{
    uint8_t next_head = (g_event_head + 1) % MAX_EVENT_QUEUE_SIZE;
    
    if (next_head == g_event_tail) {
        return SYS_ERROR;
    }
    
    g_event_queue[g_event_head].type = type;
    g_event_queue[g_event_head].timestamp = g_system_tick;
    g_event_queue[g_event_head].data = data;
    g_event_queue[g_event_head].data_len = len;
    
    g_event_head = next_head;
    
    return SYS_OK;
}

sys_status_t event_subscribe(event_type_t type, event_handler_t handler)
{
    if (g_listener_count &gt;= MAX_EVENT_QUEUE_SIZE) {
        return SYS_ERROR;
    }
    
    g_listeners[g_listener_count].event_type = type;
    g_listeners[g_listener_count].handler = handler;
    g_listener_count++;
    
    return SYS_OK;
}

void event_process(void)
{
    while (g_event_head != g_event_tail) {
        event_t *event = &amp;g_event_queue[g_event_tail];
        
        for (uint8_t i = 0; i &lt; g_listener_count; i++) {
            if (g_listeners[i].event_type == event-&gt;type || 
                g_listeners[i].event_type == EVENT_NONE) {
                if (g_listeners[i].handler != NULL) {
                    g_listeners[i].handler(event);
                }
            }
        }
        
        g_event_tail = (g_event_tail + 1) % MAX_EVENT_QUEUE_SIZE;
    }
}

void task_init(void)
{
    g_task_count = 0;
    memset(g_tasks, 0, sizeof(g_tasks));
}

int8_t task_create(task_func_t func, void *param, uint32_t interval)
{
    if (g_task_count &gt;= MAX_TASK_COUNT) {
        return -1;
    }
    
    g_tasks[g_task_count].func = func;
    g_tasks[g_task_count].param = param;
    g_tasks[g_task_count].interval = interval;
    g_tasks[g_task_count].last_run = 0;
    g_tasks[g_task_count].state = TASK_STATE_STOPPED;
    g_tasks[g_task_count].enabled = 0;
    
    return g_task_count++;
}

sys_status_t task_start(int8_t task_id)
{
    if (task_id &lt; 0 || task_id &gt;= g_task_count) {
        return SYS_INVALID_PARAM;
    }
    
    g_tasks[task_id].enabled = 1;
    g_tasks[task_id].state = TASK_STATE_RUNNING;
    g_tasks[task_id].last_run = g_system_tick;
    
    return SYS_OK;
}

sys_status_t task_stop(int8_t task_id)
{
    if (task_id &lt; 0 || task_id &gt;= g_task_count) {
        return SYS_INVALID_PARAM;
    }
    
    g_tasks[task_id].enabled = 0;
    g_tasks[task_id].state = TASK_STATE_STOPPED;
    
    return SYS_OK;
}

sys_status_t task_set_interval(int8_t task_id, uint32_t interval)
{
    if (task_id &lt; 0 || task_id &gt;= g_task_count) {
        return SYS_INVALID_PARAM;
    }
    
    g_tasks[task_id].interval = interval;
    
    return SYS_OK;
}

void task_scheduler(void)
{
    for (uint8_t i = 0; i &lt; g_task_count; i++) {
        if (g_tasks[i].enabled &amp;&amp; g_tasks[i].state == TASK_STATE_RUNNING) {
            if (g_system_tick - g_tasks[i].last_run &gt;= g_tasks[i].interval) {
                if (g_tasks[i].func != NULL) {
                    g_tasks[i].func(g_tasks[i].param);
                }
                g_tasks[i].last_run = g_system_tick;
            }
        }
    }
}

void SysTick_Handler_Callback(void)
{
    g_system_tick++;
}

uint32_t get_system_tick(void)
{
    return g_system_tick;
}

