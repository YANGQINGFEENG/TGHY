#include "led.h"
#include "delay.h"
#include "key.h"
#include "sys.h"
#include "usart.h"
#include "uart2.h"
#include "RingBuffer.h"
#include "atk_d43.h"
#include "string.h"

/**
 * ****************************************************************************
 * @file            main.c
 * @author          正点原子团队（ALIENTEK）
 * @version         V1.0
 * @data            2020-04-14
 * @brief           main函数代码
 * @copyright       Copyright (c) 2020-2032, 广州市星翼电子科技有限公司
 * ****************************************************************************
 * @attention       
 * 
 * 实验平台：正点原子STM32F103开发板    +   正点原子ATK-M750/ATK-M751（4G DTU产品）
 * 在线视频:www.yuanzige.com
 * 技术论坛:www.openedv.com
 * 公司网址:www.alientek.com
 * 购买地址:openedv.taobao.com
 * 
 * 修改说明
 * V1.0 20200414
 * 第一次发布
 * ****************************************************************************
*/

#define DTU_TEST_DATA "ALIENTEK ATK-D4X TEST"

#define DTU_NETDATA_RX_BUF     (1024)
#define UART1_RX_BUF_SIZE     (1024)

static uint32_t dtu_rxlen = 0;
static uint8_t dtu_rxbuf[DTU_NETDATA_RX_BUF];

static uint8_t uart1_rxbuf[UART1_RX_BUF_SIZE];  // 用于存储UART1接收到的数据
static uint32_t uart1_rxlen = 0;               // UART1接收数据的长度

RingBuffer *p_uart2_rxbuf;

int main(void)
{
    int ret;
    uint32_t timeout = 0;
    uint8_t buf;
    uint8_t key;

    NVIC_PriorityGroupConfig(NVIC_PriorityGroup_2); /*设置NVIC中断分组2:2位抢占优先级，2位响应优先级*/

    delay_init();                                   /*延时函数初始化*/
    LED_Init();                                     /*LED端口初始化*/
    KEY_Init();                                     /* 按键初始化 */
    my_mem_init(SRAMIN);                            /*初始化内存池*/

    p_uart2_rxbuf = RingBuffer_Malloc(1024);        /*从内存池中分配1K的内存给串口3接收DTU数据*/

    uart_init(115200);                              /*串口1初始化，波特率为115200*/

  /*  与DTU通讯的RS485初始化，波特率为115200
        特别注意：与DTU通讯的串口，串口参数请与DTU串口保持一致,否则无法正常通讯！！！！！！*/
    uart2_init(115200);

    /*
          @param       work_mode       :   DTU工作模式
        *  @arg        DTU_WORKMODE_NET,         网络透传模式
        *  @arg        DTU_WORKMODE_HTTP,        http透传模式
        *  @arg        DTU_WORKMODE_MQTT,        mqtt透传模式
        *  @arg        DTU_WORKMODE_ALIYUN,      阿里云透传模式
        *  @arg        DTU_WORKMODE_ONENET,      OneNET透传模式
        *  @arg        DTU_WORKMODE_YUANZIYUN,   原子云云透传模式（新版+旧版）
        
        
        *@param        collect_mode     :    数据采集模式
        * @arg            DTU_COLLECT_OFF,        0,    关闭采集功能
        * @arg            DTU_COLLECT_TRANS,        1,    自定义透传采集功能
        * @arg            DTU_COLLECT_MODBUS_USER 2,  Modbus自定义采集
        * @arg            DTU_COLLECT_MODBUS_ALI  3,  Modbus阿里云采集（物模型）
        * @arg            DTU_COLLECT_MODBUS_ONENET 4,Modbus OneNET采集（物模型）

        说明：每个模式都需要进行参数配置，请在atk_d4x.c文件下找到以下定义进行相应的参数修改方可使用，默认参数不保证能正常传输数据！！！
        基础参数：dtu_basic_conf_param_info
        工作模式：dtu_net_param_info/dtu_http_param_info/dtu_mqtt_param_info/dtu_aliyun_param_info/dtu_onenet_param_info/dtu_yuanziyun_param_info
        数据采集：dtu_collect_disable_param_info/dtu_collect_trans_poll_param_info/dtu_collect_modbus_user_param_info/dtu_collect_modbus_ali_param_info/dtu_collect_modbus_onenet_param_info
    */
    printf("Wait for Cat1 DTU to start, wait 15s.... \r\n");
    
    while( timeout <= 10 )   /* 等待Cat1 DTU启动，需要等待5-6s才能启动 */
    {   
        ret = dtu_config_init(DTU_WORKMODE_NET, DTU_COLLECT_OFF);    /*初始化DTU工作信息*/
        if( ret == 0 )
            break;
        timeout++;
        delay_ms(1000);
    }
            
    while(timeout <= 10)        /* 参数配置完成后，需要重启 */
    {
        ret = dtu_power_reset();
        if( ret == 0 )
            break;
        timeout++;
        delay_ms(1000);                        
    }
            
    if(timeout <= 10)                /* 再次等待Cat1 DTU启动，需要等待5-6s才能启动 */
    {
        delay_ms(5000);
    }

    while( timeout > 10 )   /* 超时 */
    {
        printf("**************************************************************************\r\n");
        printf("ATK-DTU Init Fail ...\r\n");
        printf("请按照以下步骤进行检查:\r\n");
        printf("1.使用电脑上位机配置软件检查DTU能否单独正常工作\r\n");
        printf("2.检查DTU串口参数与STM32通讯的串口参数是否一致\r\n");
        printf("3.检查DTU与STM32串口的接线是否正确\r\n");
        printf("4.检查代码配置指令是否有误");
        printf("5.检查DTU供电是否正常，DTU推荐使用12V/1A电源供电，不要使用USB的5V给模块供电！！\r\n");
        printf("**************************************************************************\r\n\r\n");
        delay_ms(3000);
    }
    printf("Cat1 DTU Init Successs \r\n"); 
    dtu_rxlen = 0;
    RingBuffer_Reset(p_uart2_rxbuf);
    /*  
        DTU进入透传状态后，就可以把它当成普通串口使用，必须确保：1.硬件连接完好 2.串口参数与DTU的保持一致
        注意：DTU每次上电需要一定的时间，在等待连接过程中，MCU可以向DTU发送数据并缓存在DTU中，等到与服务器连接上，DTU会自动将数据缓存数据全部转发到服务器上。
    */
    while (1)
    {
        if (RingBuffer_Len(p_uart2_rxbuf) > 0)          /*接收到DTU传送过来的服务器数据*/
        {
            RingBuffer_Out(p_uart2_rxbuf, &buf, 1);
            dtu_rxbuf[dtu_rxlen++] = buf;
            dtu_get_urc_info(buf);                      /*解析DTU上报的URC信息*/
            if (dtu_rxlen >= DTU_NETDATA_RX_BUF)        /*接收缓存溢出*/
            {
                usart1_send_data(dtu_rxbuf, dtu_rxlen); /*接收到从DTU传过来的网络数据，转发到调试串口1输出*/
                memset(dtu_rxbuf, 0x00, sizeof(dtu_rxbuf));
                dtu_rxlen = 0;
            }
        }
        else
        {
            if (dtu_rxlen > 0)
            {
                usart1_send_data(dtu_rxbuf, dtu_rxlen); /*接收到从DTU传过来的网络数据，转发到调试串口1输出*/
                memset(dtu_rxbuf, 0x00, sizeof(dtu_rxbuf));
                dtu_rxlen = 0;
            }
            LED0 = !LED0;
            delay_ms(100);
        }
        
        /* 处理UART1接收到的数据并通过UART2转发 */
        uart1_rxlen = uart1_receive_data(uart1_rxbuf, sizeof(uart1_rxbuf));
        if (uart1_rxlen > 0)
        {
            send_data_to_dtu(uart1_rxbuf, uart1_rxlen);
            uart1_rxlen = 0;
        }
        key = KEY_Scan(0);
        switch(key)
        {
            case KEY0_PRES:
            {
                /*如果服务器格式对数据有要求，请修改对应的数据格式，这里只限于例程测试使用*/
                send_data_to_dtu((uint8_t *)DTU_TEST_DATA, strlen(DTU_TEST_DATA));
                
                break;
            }
            case KEY1_PRES:
            {
                /* 设备状态信息查询 */
                memset(dtu_rxbuf, 0x00, DTU_NETDATA_RX_BUF);
                ret = dtu_device_state_work_info(dtu_rxbuf, DTU_NETDATA_RX_BUF);
                if (ret == 0)
                {
                    usart1_send_data(dtu_rxbuf, strlen((char *)dtu_rxbuf));
                }
                break;
            }
            default:
            {
                break;
            }
        }
    }
}
