#ifndef __LED_H
#define __LED_H     
#include "sys.h"
#include "stdbool.h"
//////////////////////////////////////////////////////////////////////////////////     
//本程序只供学习使用，未经作者许可，不得用于其它任何用途
//ALIENTEK战舰STM32开发板
//LED驱动代码       
//正点原子@ALIENTEK
//技术论坛:www.openedv.com
//修改日期:2012/9/2
//版本：V1.0
//版权所有，盗版必究。
//Copyright(C) 广州市星翼电子科技有限公司 2009-2019
//All rights reserved                                      
////////////////////////////////////////////////////////////////////////////////// 


typedef enum
{
    LED_DS0 = 0,
    LED_DS1,
}_led_eu;

typedef enum
{
    LED_OFF = 0,    
    LED_ON,
}_ctl_led_eu;

typedef struct 
{
    GPIO_TypeDef * GPIO;
    uint16_t Pin;
}_gpio_st;





#define LED0 PBout(5)// PB5
#define LED1 PEout(5)// PE5    




void LED_Init(void);//初始化

void Set_LED_Toggle(_led_eu led);
u8 Read_LED_State(void);

                             
#endif
