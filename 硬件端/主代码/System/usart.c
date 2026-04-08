#include "usart.h"
#include "atk_d43.h"

/* 如果使用OS,请包含相关头文件 */
#if SYS_SUPPORT_OS
#include "includes.h"  /* OS 使用 */
#endif

/******************************************************************************************/
/* 以下代码, 支持printf函数, 使用时需要选择use MicroLIB */

#if 1
#if (__ARMCC_VERSION >= 6010050)  /* 使用AC6编译器时 */
__asm(".global __use_no_semihosting\n\t");  /* 声明不使用半主机模式 */
__asm(".global __ARM_use_no_argv \n\t");    /* AC6编译器需要声明main函数为无参数形式，否则可能会出现半主机模式 */

#else
/* 使用AC5编译器时, 需要在头文件中定义__FILE 以不使用半主机模式 */
#pragma import(__use_no_semihosting)

struct __FILE
{
    int handle;
};

#endif

/* 不使用半主机模式时,需要重定义_ttywrch、_sys_exit和_sys_command_string函数,同时兼容AC6和AC5模式 */
int _ttywrch(int ch)
{
    ch = ch;
    return ch;
}

/* 定义_sys_exit()以避免使用半主机模式 */
void _sys_exit(int x)
{
    x = x;
}

char *_sys_command_string(char *cmd, int len)
{
    return NULL;
}

/* FILE 在 stdio.h中定义 */
FILE __stdout;

/* 重定义fputc函数, printf函数最终会调用fputc函数将字符发送出去 */
int fputc(int ch, FILE *f)
{
    while ((USART1->SR & USART_FLAG_TXE) == 0);  /* 等待上一个字符发送完成 */
    USART1->DR = (uint8_t)ch;                   /* 将需要发送的字符 ch 写入DR寄存器 */
    return ch;
}
#endif

/* 接收缓冲区, 最大USART_REC_LEN字节 */
uint8_t g_usart_rx_buf[USART_REC_LEN];

/*  接收状态
 *  bit15:      接收完成标志
 *  bit14:      接收到0x0d
 *  bit13~0:    接收到的有效字节长度
*/
uint16_t g_usart_rx_sta = 0;

uint8_t g_rx_buffer[RXBUFFERSIZE];  /* 用于接收缓冲区 */

extern GPIO_InitTypeDef GPIO_InitStructure;
extern USART_InitTypeDef USART_InitStructure;
extern NVIC_InitTypeDef NVIC_InitStructure;

/**
 * @brief       串口X初始化函数
 * @param       baudrate: 波特率, 根据自己需要设置合适的值
 * @note        注意: 初始化前需要确保时钟源, 否则可能会出现串口通信异常
 *              本代码USART的时钟源在sys_stm32_clock_init()函数中已经配置好了
 * @retval      无
 */
void usart_init(uint32_t baudrate)
{
    /* 使能GPIO和USART时钟 */
    USART_TX_GPIO_CLK_ENABLE();
    USART_RX_GPIO_CLK_ENABLE();
    USART_UX_CLK_ENABLE();

    /* 配置USART TX引脚 */
    GPIO_InitStructure.GPIO_Pin = USART_TX_GPIO_PIN;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AF_PP;
    GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
    GPIO_Init(USART_TX_GPIO_PORT, &GPIO_InitStructure);

    /* 配置USART RX引脚 */
    GPIO_InitStructure.GPIO_Pin = USART_RX_GPIO_PIN;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_IPD;
    GPIO_Init(USART_RX_GPIO_PORT, &GPIO_InitStructure);

    /* 配置USART */
    USART_InitStructure.USART_BaudRate = baudrate;
    USART_InitStructure.USART_WordLength = USART_WordLength_8b;
    USART_InitStructure.USART_StopBits = USART_StopBits_1;
    USART_InitStructure.USART_Parity = USART_Parity_No;
    USART_InitStructure.USART_HardwareFlowControl = USART_HardwareFlowControl_None;
    USART_InitStructure.USART_Mode = USART_Mode_Rx | USART_Mode_Tx;
    USART_Init(USART_UX, &USART_InitStructure);

    /* 使能USART */
    USART_Cmd(USART_UX, ENABLE);

    /* 配置中断优先级并使能中断 */
    NVIC_InitStructure.NVIC_IRQChannel = USART_UX_IRQn;
    NVIC_InitStructure.NVIC_IRQChannelPreemptionPriority = 3;
    NVIC_InitStructure.NVIC_IRQChannelSubPriority = 3;
    NVIC_InitStructure.NVIC_IRQChannelCmd = ENABLE;
    NVIC_Init(&NVIC_InitStructure);

    /* 使能USART中断 */
    USART_ITConfig(USART_UX, USART_IT_RXNE, ENABLE);
}

/**
 * @brief       串口1中断处理函数
 * @param       无
 * @retval      无
 */
void USART1_IRQHandler(void)
{
    uint8_t ch;

    if (USART_GetITStatus(USART1, USART_IT_RXNE) != RESET)
    {
        ch = USART_ReceiveData(USART1);
        
        // 处理ATK-D43的URC消息
        dtu_get_urc_info(ch);

        if ((g_usart_rx_sta & 0x8000) == 0)  /* 接收未完成 */
        {
            if (g_usart_rx_sta & 0x4000)     /* 接收到了0x0d */
            {
                if (ch != 0x0a)
                {
                    g_usart_rx_sta = 0;      /* 接收错误,重新开始 */
                }
                else
                {
                    g_usart_rx_sta |= 0x8000; /* 接收完成 */
                }
            }
            else
            {
                if (ch == 0x0d)
                {
                    g_usart_rx_sta |= 0x4000;
                }
                else
                {
                    g_usart_rx_buf[g_usart_rx_sta & 0x3FFF] = ch;
                    g_usart_rx_sta++;
                    if (g_usart_rx_sta > (USART_REC_LEN - 1))
                    {
                        g_usart_rx_sta = 0;  /* 接收数据溢出,重新开始接收 */
                    }
                }
            }
        }
    }
}

/**
 * @brief       发送字符串
 * @param       USARTx: USART地址
 * @param       str: 需要发送的字符串
 * @retval      无
 */
void USART_SendString(USART_TypeDef* USARTx, char* str)
{
    while(*str) {
        while((USARTx->SR & USART_FLAG_TXE) == 0);
        USARTx->DR = (uint8_t)*str++;
    }
}




