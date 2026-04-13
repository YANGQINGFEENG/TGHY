
#!/bin/bash

echo "========================================"
echo "智能农业监控系统 - 代码语法检查"
echo "========================================"
echo ""

FRAMEWORK_DIR="./Framework"
INCLUDE_DIRS="-I$FRAMEWORK_DIR -I$FRAMEWORK_DIR/Config -I$FRAMEWORK_DIR/Core -I$FRAMEWORK_DIR/Data -I$FRAMEWORK_DIR/Protocol -I$FRAMEWORK_DIR/Utils -I$FRAMEWORK_DIR/Tasks"
INCLUDE_DIRS="$INCLUDE_DIRS -I./User -I./System -I./Hardware -I./Start -I./Library"

# 定义一些STM32的基本类型，用于语法检查
STM32_DEFINES="-DSTM32F10X_MD -DUSE_STDPERIPH_DRIVER"

ERROR_COUNT=0
CHECKED_FILES=0

echo "检查目录: $FRAMEWORK_DIR"
echo ""

# 检查所有头文件
echo "🔍 检查头文件..."
for header in $(find $FRAMEWORK_DIR -name "*.h" 2&gt;/dev/null); do
    echo "  检查: $header"
    gcc -fsyntax-only -Wall -Wextra $INCLUDE_DIRS $STM32_DEFINES -x c -c $header 2&gt;/tmp/check_err.txt
    if [ $? -ne 0 ]; then
        echo "  ❌ 错误:"
        cat /tmp/check_err.txt
        ERROR_COUNT=$((ERROR_COUNT + 1))
    fi
    CHECKED_FILES=$((CHECKED_FILES + 1))
done

echo ""
echo "🔍 检查源文件..."
for source in $(find $FRAMEWORK_DIR -name "*.c" 2&gt;/dev/null); do
    echo "  检查: $source"
    gcc -fsyntax-only -Wall -Wextra $INCLUDE_DIRS $STM32_DEFINES -c $source 2&gt;/tmp/check_err.txt
    if [ $? -ne 0 ]; then
        echo "  ❌ 错误:"
        cat /tmp/check_err.txt
        ERROR_COUNT=$((ERROR_COUNT + 1))
    fi
    CHECKED_FILES=$((CHECKED_FILES + 1))
done

echo ""
echo "========================================"
echo "检查完成!"
echo "检查文件总数: $CHECKED_FILES"
echo "错误数量: $ERROR_COUNT"

if [ $ERROR_COUNT -eq 0 ]; then
    echo "✅ 所有文件语法检查通过!"
else
    echo "❌ 发现 $ERROR_COUNT 个错误，请修复!"
fi
echo "========================================"

rm -f /tmp/check_err.txt

exit $ERROR_COUNT

