
#ifndef __FRAMEWORK_H
#define __FRAMEWORK_H

#include "Config/sys_config.h"
#include "Core/event.h"
#include "Data/data_manager.h"
#include "Protocol/protocol.h"
#include "Utils/logger.h"
#include "Tasks/tasks.h"

void framework_init(void);
void framework_run(void);

#endif

