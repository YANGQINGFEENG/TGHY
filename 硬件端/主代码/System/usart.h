#ifndef __USART_H
#define __USART_H

#include "stm32f10x.h"
#include "stdio.h"

/******************************************************************************************/
/* 引脚定义 */
/* 默认使用USART1 */
/* 注意: 通过修改前10行定义,可以支持USART1~UART5任意一个串口 */
#define USART_TX_GPIO_PORT                  GPIOA
#define USART_TX_GPIO_PIN                   GPIO_Pin_9
#define USART_TX_GPIO_CLK_ENABLE()          RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOA, ENABLE)

#define USART_RX_GPIO_PORT                  GPIOA
#define USART_RX_GPIO_PIN                   GPIO_Pin_10
#define USART_RX_GPIO_CLK_ENABLE()          RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOA, ENABLE)

#define USART_UX                            USART1
#define USART_UX_IRQn                       USART1_IRQn
#define USART_UX_IRQHandler                 USART1_IRQHandler
#define USART_UX_CLK_ENABLE()               RCC_APB2PeriphClockCmd(RCC_APB2Periph_USART1, ENABLE)

/******************************************************************************************/

#define USART_REC_LEN               200         /* 最大接收字节数 200 */
#define USART_EN_RX                 1           /* 使能，1开/关闭0，默认1开 */
#define RXBUFFERSIZE                1           /* 接收大小 */

extern uint8_t g_usart_rx_buf[USART_REC_LEN];  /* 接收缓冲区，最大USART_REC_LEN字节，末尾字节为结束符 */
extern uint16_t g_usart_rx_sta;               /* 接收状态标记 */
extern uint8_t g_rx_buffer[RXBUFFERSIZE];     /* HAL库USART使用Buffer */

void usart_init(uint32_t bound);              /* 串口初始化函数 */
void USART_SendString(USART_TypeDef* USARTx, char* str); /* 发送字符串 */

#endif /* __USART_H */


