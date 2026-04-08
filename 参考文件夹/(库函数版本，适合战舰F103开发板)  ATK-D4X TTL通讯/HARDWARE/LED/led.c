#include "led.h"
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




#define LED_Max_NUM        2

static _gpio_st LED_GPIO[LED_Max_NUM] =
{
    [LED_DS0] = {GPIOB, GPIO_Pin_5},
    [LED_DS1] = {GPIOE, GPIO_Pin_5},
};


//初始化PB5和PE5为输出口.并使能这两个口的时钟
//LED IO初始化
void LED_Init(void)
{

    GPIO_InitTypeDef  GPIO_InitStructure;

    RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOB | RCC_APB2Periph_GPIOE, ENABLE);     //使能PB,PE端口时钟

    GPIO_InitStructure.GPIO_Pin = GPIO_Pin_5;                 //LED0-->PB.5 端口配置
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_Out_PP;          //推挽输出
    GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;         //IO口速度为50MHz
    GPIO_Init(GPIOB, &GPIO_InitStructure);                     //根据设定参数初始化GPIOB.5
    GPIO_SetBits(GPIOB, GPIO_Pin_5);                         //PB.5 输出高

    GPIO_InitStructure.GPIO_Pin = GPIO_Pin_5;                 //LED1-->PE.5 端口配置, 推挽输出
    GPIO_Init(GPIOE, &GPIO_InitStructure);                       //推挽输出 ，IO口速度为50MHz
    GPIO_SetBits(GPIOE, GPIO_Pin_5);                          //PE.5 输出高

}

//设置LED灯的状态翻转
void Set_LED_Toggle(_led_eu led)
{
    if( GPIO_ReadOutputDataBit(LED_GPIO[led].GPIO, LED_GPIO[led].Pin) == Bit_SET )
    {
        GPIO_ResetBits(LED_GPIO[led].GPIO, LED_GPIO[led].Pin);
    }
    else
    {
        GPIO_SetBits(LED_GPIO[led].GPIO, LED_GPIO[led].Pin);
    }
}

/*
    两个LED灯状态
        Bit0: DS0灯的状态
        Bit1: DS1灯的状态
        其它位未用
    其中:0表示灯灭；1表示灯亮
*/
//读LED灯当前状态
//返回：当前LED灯状态
u8 Read_LED_State(void)
{
    u8 sta = 0 ;

    for(u8 i = 0; i < LED_Max_NUM; i++)
    {
        if(GPIO_ReadOutputDataBit(LED_GPIO[i].GPIO, LED_GPIO[i].Pin))
        {
            sta &= ~(1 << i);
        }

        else
        {
            sta |= 1 << i;
        }
    }

    return sta;
}



