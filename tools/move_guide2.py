import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# The target block to move is from "      <!-- 상세 -->" to the end of the guide div.
# We can find it by looking for "      <!-- 상세 -->" and the next "      <!-- ════════════════════════════════════" that precedes "서류 접수 폼".

guide_start = content.find('      <!-- 상세 -->')
guide_end = content.find('      <!-- ════════════════════════════════════\n         서류 접수 폼 (마감 전에만 표시)')

if guide_start == -1 or guide_end == -1:
    print("Could not find guide block boundaries")
    exit(1)

guide_block = content[guide_start:guide_end]

# Remove the guide block from its original position
content = content[:guide_start] + content[guide_end:]

# Now find where to insert it. We want it below "공식 일정"
# Let's look for "<!-- 참가신청 버튼 / 마감 배너 / 영상제출"
insert_pos = content.find('      <!-- ════════════════════════════════════\n         참가신청 버튼 / 마감 배너 / 영상제출')

if insert_pos == -1:
    print("Could not find insertion point")
    exit(1)

# Insert the guide block right before the insert_pos
new_content = content[:insert_pos] + guide_block + content[insert_pos:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Moved guide block successfully.")
