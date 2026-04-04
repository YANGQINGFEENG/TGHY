/**
 ****************************************************************************************************
 * @file        atk_mb026_uart.c
 * @author      ʺ���������\(ALIENTEK)
 * @version     V1.0
 * @date        2024-11-28
 * @brief       ATK-MB026 UART�����g������
 * @license     Copyright (c) 2020-2032, ���nƫ���ɸF���H���͌�����
 ****************************************************************************************************
 * @attention
 *
 * �S�΍g�:ʺ������ M48Z-M3�|�o����ҽSTM32F103��
 * ��?ƪײ:www.yuanzige.com
 * �ұ�̥��:www.openedv.com
 * �������{:www.alientek.com
 * ���k���{:openedv.taobao.com
 *
 ****************************************************************************************************
 */

#include "atk_mb026_uart.h"
#include "delay.h"
#include "RS485.h"
#include <stdarg.h>
#include <stdio.h>
#include <string.h>

/* �f�ȿ߃W�b���ؼďo */
#define TX_BUF_SIZE 128

/* UART���x�b�� */
uint8_t g_uart_rx_frame[ATK_MB026_UART_RX_BUF_SIZE];
/* UART���򝙸��� */
struct {
    uint16_t len    : 15;  /* ���x���h���󺣘I?sta[14:0] */
    uint16_t finsh  : 1;   /* ���x�m���׍�?sta[15] */
} g_sta;

/* �߃W�b���زōyį */
uint8_t tx_buf[TX_BUF_SIZE];
volatile uint16_t tx_head = 0;
volatile uint16_t tx_tail = 0;

/* �f�������ɹ������ */
TIM_TimeBaseInitTypeDef  TIM_TimeBaseStructure;
/* USART����ɹ������ */
extern USART_InitTypeDef USART_InitStructure;
/* GPIO����ɹ������ */
extern GPIO_InitTypeDef GPIO_InitStructure;
/* NVIC����ɹ������ */
extern NVIC_InitTypeDef NVIC_InitStructure;

/**
 * @brief       ATK-MB026 UART printf�۷�
 * @param       fmt: ���Bɹ�⑗��
 * @retval      ��
 */
void atk_mb026_uart_printf(char *fmt, ...)
{
    va_list ap;
    char buf[128];
    uint16_t len;
    
    va_start(ap, fmt);
    len = vsnprintf(buf, sizeof(buf), fmt, ap);
    va_end(ap);
    
    if (len > 0) {
        // ��������ؿ߃W�b����
        for (uint16_t i = 0; i < len; i++) {
            tx_buf[tx_head] = buf[i];
            tx_head = (tx_head + 1) % TX_BUF_SIZE;
        }
        
        // �ᴭ�߃W��H
        USART_ITConfig(USART3, USART_IT_TXE, ENABLE);
    }
}

/**
 * @brief       ATK-MB026 UART��Ǫ�g�����x����
 * @param       ��
 * @retval      ��
 */
void atk_mb026_uart_rx_restart(void)
{
    g_sta.len = 0;
    g_sta.finsh = 0;
}

/**
 * @brief       �Y��ATK-MB026 UART���x���h�R�췽��
 * @param       ��
 * @retval      NULL: ¡���x���mƨ������
 *              �M�O: �y�D���x���h����b����
 */
uint8_t *atk_mb026_uart_rx_get_frame(void)
{
    if (g_sta.finsh == 1)
    {
        g_uart_rx_frame[g_sta.len] = '\0';
        return g_uart_rx_frame;
    }
    else
    {
        return NULL;
    }
}

/**
 * @brief       �Y��ATK-MB026 UART���x���h�������h���I
 * @param       ��
 * @retval      ���x���h�������h���I
 */
uint16_t atk_mb026_uart_rx_get_frame_len(void)
{
    return g_sta.finsh ? g_sta.len : 0;
}

/**
 * @brief       ATK-MB026 UART����ɹ
 * @param       baudrate: UART嶃��\�ɗ�
 * @retval      ��
 */
void atk_mb026_uart_init(uint32_t baudrate)
{
    GPIO_InitTypeDef GPIO_InitStructure;
    NVIC_InitTypeDef NVIC_InitStructure;
    USART_InitTypeDef USART_InitStructure;
    TIM_TimeBaseInitTypeDef TIM_TimeBaseStructure;
    
    // 1. �����
    RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOB | RCC_APB2Periph_AFIO, ENABLE);
    RCC_APB1PeriphClockCmd(RCC_APB1Periph_USART3 | RCC_APB1Periph_TIM2, ENABLE);
    
    // 2. ����USART3���� (PB10: TX, PB11: RX)
    // TX��������
    GPIO_InitStructure.GPIO_Pin = ATK_MB026_UART_TX_GPIO_PIN;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AF_PP;
    GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
    GPIO_Init(ATK_MB026_UART_TX_GPIO_PORT, &GPIO_InitStructure);
    
    // RX��������
    GPIO_InitStructure.GPIO_Pin = ATK_MB026_UART_RX_GPIO_PIN;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_IN_FLOATING;
    GPIO_Init(ATK_MB026_UART_RX_GPIO_PORT, &GPIO_InitStructure);
    
    // 3. ����USART3�跽
    USART_InitStructure.USART_BaudRate = baudrate;
    USART_InitStructure.USART_WordLength = USART_WordLength_8b;
    USART_InitStructure.USART_StopBits = USART_StopBits_1;
    USART_InitStructure.USART_Parity = USART_Parity_No;
    USART_InitStructure.USART_HardwareFlowControl = USART_HardwareFlowControl_None;
    USART_InitStructure.USART_Mode = USART_Mode_Tx | USART_Mode_Rx;
    USART_Init(ATK_MB026_UART_INTERFACE, &USART_InitStructure);
    
    // 4. ����USART3��H
    NVIC_InitStructure.NVIC_IRQChannel = ATK_MB026_UART_IRQn;
    NVIC_InitStructure.NVIC_IRQChannelPreemptionPriority = 1;
    NVIC_InitStructure.NVIC_IRQChannelSubPriority = 1;
    NVIC_InitStructure.NVIC_IRQChannelCmd = ENABLE;
    NVIC_Init(&NVIC_InitStructure);
    
    // 5. ��USART3���x��H
    USART_ITConfig(ATK_MB026_UART_INTERFACE, USART_IT_RXNE, ENABLE);
    
    // 6. ��USART3
    USART_Cmd(ATK_MB026_UART_INTERFACE, ENABLE);
    
    // 7. 配置TIM2定时器，用于UART接收超时检测
    // 增加超时时间到200ms（原来约83ms）
    TIM_TimeBaseStructure.TIM_Period = 240 - 1;  // 240 * (1/1200) = 200ms
    TIM_TimeBaseStructure.TIM_Prescaler = ATK_MB026_TIM_PRESCALER - 1;  // 72MHz/60000 = 1200Hz
    TIM_TimeBaseStructure.TIM_ClockDivision = TIM_CKD_DIV1;
    TIM_TimeBaseStructure.TIM_CounterMode = TIM_CounterMode_Up;
    TIM_TimeBaseInit(ATK_MB026_TIM_INTERFACE, &TIM_TimeBaseStructure);
    
    // 8. 配置TIM2中断
    NVIC_InitStructure.NVIC_IRQChannel = ATK_MB026_TIM_IRQn;
    NVIC_InitStructure.NVIC_IRQChannelPreemptionPriority = 2;
    NVIC_InitStructure.NVIC_IRQChannelSubPriority = 1;
    NVIC_Init(&NVIC_InitStructure);
    TIM_ITConfig(ATK_MB026_TIM_INTERFACE, TIM_IT_Update, ENABLE);
    
    // 注意：不要在初始化时启用TIM2，应该在接收到第一个字节时再启用
    // TIM_Cmd(TIM2, ENABLE);  // 移除此行

		
		
    // ����ɹ�������ӳ�
    g_sta.len = 0;
    g_sta.finsh = 0;
    tx_head = 0;
    tx_tail = 0;
}


/**
 * @brief USART3�жϷ�����
 * @note ����UART���ݽ��պͷ���
 */
void USART3_IRQHandler(void)
{
    uint8_t tmp;
    
    /* 1. �������ش��� */
    if (USART_GetITStatus(USART3, USART_IT_ORE) != RESET)
    {
        USART_ClearITPendingBit(USART3, USART_IT_ORE);
        (void)USART_ReceiveData(USART3); // ��ȡDR�Ĵ�����������־
    }
    
    /* 2. 处理接收中断 */
    if (USART_GetITStatus(USART3, USART_IT_RXNE) != RESET)
    {
        tmp = USART_ReceiveData(USART3);
        
        // 调试：打印接收到的字节
        printf("%02X ", tmp);
        
        // Modbus RTU协议：通过超时判断帧结束
        // 存储到接收缓冲区
        if ((USART3_RX_STA & 0x8000) == 0)  // 接收未完成
        {
            // 存储数据
            USART3_RX_BUF[USART3_RX_STA & 0x3FFF] = tmp;
            USART3_RX_STA++;
            
            // 检查缓冲区溢出
            if (USART3_RX_STA > (USART3_REC_LEN - 1))
            {
                USART3_RX_STA = 0;  // 缓冲区溢出，重新开始
            }
        }
        
        /* 处理接收缓冲区 */
        if (g_sta.len < (ATK_MB026_UART_RX_BUF_SIZE - 1))
        {
            TIM_SetCounter(TIM2, 0); // 重置定时器计数
            
            /* 如果是第一个字节，开启定时器 */
            if (g_sta.len == 0)
            {
                TIM_Cmd(TIM2, ENABLE);
            }
            
            /* 存储接收到的字节 */
            g_uart_rx_frame[g_sta.len] = tmp;
            g_sta.len++;
        }
        else
        {
            /* 接收缓冲区满 */
            g_sta.len = 0;
            g_uart_rx_frame[g_sta.len] = tmp;
            g_sta.len++;
        }
    }
    
    /* 3. ���������ж� */
    if (USART_GetITStatus(USART3, USART_IT_TXE) != RESET)
    {
        if (tx_head != tx_tail)
        {
            /* ���ͻ������е����� */
            USART_SendData(USART3, tx_buf[tx_tail]);
            tx_tail = (tx_tail + 1) % TX_BUF_SIZE;
        }
        else
        {
            /* ���ͻ�����Ϊ�գ����÷����ж� */
            USART_ITConfig(USART3, USART_IT_TXE, DISABLE);
        }
    }
}

/**
 * @brief TIM2�жϷ�����
 * @note ����UART���ճ�ʱ
 */
void TIM2_IRQHandler(void)
{
    if (TIM_GetITStatus(TIM2, TIM_IT_Update) != RESET)
    {
        /* 清除中断标志 */
        TIM_ClearITPendingBit(TIM2, TIM_IT_Update);
        
        /* 关闭定时器 */
        TIM_Cmd(TIM2, DISABLE);
        
        /* 设置帧接收完成标志 */
        g_sta.finsh = 1;
        
        /* Modbus RTU协议：超时表示帧结束，设置接收完成标志 */
        // 如果有接收到数据，设置完成标志
        uint16_t rx_len = USART3_RX_STA & 0x3FFF;
        if (rx_len > 0)
        {
            USART3_RX_STA |= 0x8000;  // 设置接收完成标志
            printf("\r\n[TIM2] 超时触发，设置接收完成标志，len=%d\r\n", rx_len);
        }
        else
        {
            printf("\r\n[TIM2] 超时触发，但没有接收到数据\r\n");
        }
        
        /* 处理485接收到的数据 */
        extern void Serial2_ProcessResponse(void);
        Serial2_ProcessResponse();
    }
}

/**
 * @brief ͨ��USART3�������ݣ���������
 * @param data Ҫ���͵�����
 * @param len ���ݳ���
 */
void usart3_send_data(const uint8_t *data, uint16_t len)
{
    for (uint16_t i = 0; i < len; i++) {
        tx_buf[tx_head] = data[i];
        tx_head = (tx_head + 1) % TX_BUF_SIZE;
    }
    
    // ���÷����ж�
    USART_ITConfig(USART3, USART_IT_TXE, ENABLE);
}



