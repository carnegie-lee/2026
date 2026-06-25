import sys

def main():
    with open('index.html', 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Find the start of #schedule-top end div
    # Around line 201: </div>\n      </div>\n      <!-- 참가신청 버튼...
    
    # 1. Extract the guide section
    guide_start = -1
    guide_end = -1
    
    for i, line in enumerate(lines):
        if '<!-- 상세 -->' in line and 'id="guide"' in lines[i+1]:
            guide_start = i
        if guide_start != -1 and '<!-- 서류 접수 폼 (마감 전에만 표시)' in line:
            # We want to end right before the form section comment
            # actually let's find the closing div of #guide
            guide_end = i - 1
            while lines[guide_end].strip() == '' or lines[guide_end].strip() == '<!-- ════════════════════════════════════':
                guide_end -= 1
            break
            
    if guide_start == -1 or guide_end == -1:
        print("Could not find guide section")
        return
        
    # The end of guide is the line with </div> for #guide
    # Let's just find the exact block:
    # 315:       <!-- 상세 -->
    # ...
    # 492:       </div>
    # 493: 
    # 494:       <!-- ════════════════════════════════════
    # 495:          서류 접수 폼 (마감 전에만 표시)
    
    # Let's dynamically find it based on exact lines if possible, or string matching
    start_idx = -1
    end_idx = -1
    for i in range(len(lines)):
        if '<!-- 상세 -->' in lines[i]:
            start_idx = i
            break
            
    for i in range(start_idx, len(lines)):
        if '<!-- 서류 접수 폼 (마감 전에만 표시)' in lines[i]:
            end_idx = i - 2 # To include the empty line and the comment block start
            while '════════════════' in lines[end_idx]:
                end_idx -= 1
            break
            
    print(f"Guide block: {start_idx} to {end_idx}")
    guide_block = lines[start_idx:end_idx+1]
    
    # Remove it from the original place
    del lines[start_idx:end_idx+1]
    
    # Find where to insert (after #schedule-top)
    insert_idx = -1
    for i in range(len(lines)):
        if '<!-- ════════════════════════════════════' in lines[i] and '참가신청 버튼 / 마감 배너 / 영상제출' in lines[i+1]:
            insert_idx = i
            break
            
    print(f"Insert at: {insert_idx}")
    lines[insert_idx:insert_idx] = guide_block
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.writelines(lines)

main()
