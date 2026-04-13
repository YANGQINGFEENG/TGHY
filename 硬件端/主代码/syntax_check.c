
#include "test_types.h"

#define STM32F10X_MD
#define USE_STDPERIPH_DRIVER

#include "Framework/Config/sys_config.h"
#include "Framework/Core/event.h"
#include "Framework/Data/data_manager.h"
#include "Framework/Protocol/protocol.h"
#include "Framework/Utils/logger.h"
#include "Framework/Tasks/tasks.h"
#include "Framework/framework.h"

int main(void)
{
    framework_init();
    tasks_init();
    framework_run();
    return 0;
}

