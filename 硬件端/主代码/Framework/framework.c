
#include "framework.h"
#include "Delay.h"

void framework_init(void)
{
    sys_config_init();
    log_init();
    event_init();
    task_init();
    data_manager_init();
    protocol_init();
    
    log_info(LOG_TAG_SYS, "Framework initialized, version %d.%d.%d", 
             FW_VERSION_MAJOR, FW_VERSION_MINOR, FW_VERSION_PATCH);
}

void framework_run(void)
{
    while (1) {
        event_process();
        task_scheduler();
        data_update_system_status();
        delay_ms(1);
    }
}

