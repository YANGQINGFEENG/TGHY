
#!/bin/bash

echo "========================================"
echo "智能农业监控系统 - 代码语法检查"
echo "========================================"
echo ""

FRAMEWORK_DIR="./Framework"
INCLUDE_DIRS="-I$FRAMEWORK_DIR -I$FRAMEWORK_DIR/Config -I$FRAMEWORK_DIR/Core -I$FRAMEWORK_DIR/Data -I$FRAMEWORK_DIR/Protocol -I$FRAMEWORK_DIR/Utils -I$FRAMEWORK_DIR/Tasks"
INCLUDE_DIRS="$INCLUDE_DIRS -I./User -I./System -I./Hardware -I./Start -I./Library"

STM32_DEFINES="-DSTM32F10X_MD -DUSE_STDPERIPH_DRIVER"

ERROR_COUNT=0
CHECKED_FILES=0

echo "检查目录: $FRAMEWORK_DIR"
echo ""

check_file() {
    local file=$1
    echo "  检查: $file"
    gcc -fsyntax-only -Wall -Wextra $INCLUDE_DIRS $STM32_DEFINES -x c -c "$file" 2&gt;&amp;1 | while read line; do
        echo "  $line"
    done
    return ${PIPESTATUS[0]}
}

echo "🔍 检查头文件..."
for header in $FRAMEWORK_DIR/*.h $FRAMEWORK_DIR/Config/*.h $FRAMEWORK_DIR/Core/*.h $FRAMEWORK_DIR/Data/*.h $FRAMEWORK_DIR/Protocol/*.h $FRAMEWORK_DIR/Utils/*.h $FRAMEWORK_DIR/Tasks/*.h; do
    if [ -f "$header" ]; then
        check_file "$header"
        if [ $? -ne 0 ]; then
            ERROR_COUNT=$((ERROR_COUNT + 1))
        fi
        CHECKED_FILES=$((CHECKED_FILES + 1))
    fi
done

echo ""
echo "🔍 检查源文件..."
for source in $FRAMEWORK_DIR/*.c $FRAMEWORK_DIR/Config/*.c $FRAMEWORK_DIR/Core/*.c $FRAMEWORK_DIR/Data/*.c $FRAMEWORK_DIR/Protocol/*.c $FRAMEWORK_DIR/Utils/*.c $FRAMEWORK_DIR/Tasks/*.c; do
    if [ -f "$source" ]; then
        check_file "$source"
        if [ $? -ne 0 ]; then
            ERROR_COUNT=$((ERROR_COUNT + 1))
        fi
        CHECKED_FILES=$((CHECKED_FILES + 1))
    fi
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

exit $ERROR_COUNT

