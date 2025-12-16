import os
import datetime

# =============================================================
# CONFIG
# =============================================================
OUTPUT_NAME = None  # None -> tự đặt tên theo thư mục

ALLOWED_EXTENSIONS = [
    ".ts", ".tsx", ".mjs",
    ".json", ".md", ".sql",
    ".css",
    ".jpg", ".png", ".svg", ".ico",
    ".env", ".env.example", ".gitignore"
]

TEXT_EXTENSIONS = [
    ".ts", ".tsx", ".mjs",
    ".json", ".md", ".sql",
    ".css",
    ".env", ".env.example", ".gitignore"
]

# =============================================================
# CONSTANTS
# =============================================================
EXCLUDED_DIRS = {"node_modules"}  # 🚫 tuyệt đối bỏ qua

# =============================================================
# BANNER
# =============================================================
def make_banner(module_name):
    return f"""
################################################################################
#                      {module_name.upper():<50}#
#                   SOURCE CODE DOCUMENTATION GENERATOR                    #
#                     Version 2.1.0 - NODE_MODULES SAFE MODE               #
################################################################################
"""

# =============================================================
# FILE FILTER
# =============================================================
def is_allowed_file(filename):
    filename = filename.lower()
    return any(filename.endswith(ext) for ext in ALLOWED_EXTENSIONS)

# =============================================================
# SCAN FILES (NODE_MODULES BLOCKED ABSOLUTELY)
# =============================================================
def scan_files(root):
    file_list = []

    for base, dirs, files in os.walk(root):
        # 🚫 LOẠI BỎ node_modules Ở MỌI CẤP
        dirs[:] = [
            d for d in dirs
            if d.lower() not in EXCLUDED_DIRS
        ]

        dirs.sort()
        files.sort()

        for f in files:
            if not is_allowed_file(f):
                continue

            full_path = os.path.join(base, f)
            rel = os.path.relpath(full_path, root).replace("\\", "/")
            file_list.append(rel)

    return file_list

# =============================================================
# DETECT FILE TYPE
# =============================================================
def detect_type(file):
    file = file.lower()

    if file.endswith(".ts"):
        return "TypeScript"
    if file.endswith(".tsx"):
        return "React TSX"
    if file.endswith(".mjs"):
        return "JavaScript Module"
    if file.endswith(".json"):
        return "JSON Config"
    if file.endswith(".md"):
        return "Markdown"
    if file.endswith(".sql"):
        return "SQL Script"
    if file.endswith(".css"):
        return "CSS Style"
    if file.endswith((".jpg", ".png", ".svg", ".ico")):
        return "Image / Asset"
    if file.endswith(".env"):
        return "Environment Config"
    if file.endswith(".env.example"):
        return "Env Template"
    if file.endswith(".gitignore"):
        return "Git Config"

    return "Other"

# =============================================================
# GENERATE TREE
# =============================================================
def generate_tree(files):
    lines = []
    lines.append("================================================================================")
    lines.append(f"                        CẤU TRÚC FILE - {len(files)} FILES")
    lines.append("================================================================================\n")

    for idx, f in enumerate(files, start=1):
        lines.append(f"{idx:>3}.  {f}")

    lines.append("\n")
    return "\n".join(lines)

# =============================================================
# GENERATE SUMMARY
# =============================================================
def generate_summary(files):
    lines = []
    lines.append("================================================================================")
    lines.append("                     BẢNG TỔNG KẾT PHÂN LOẠI FILES")
    lines.append("================================================================================")
    lines.append("│  #  │ Đường dẫn file                                     │ Loại            │")
    lines.append("├─────┼────────────────────────────────────────────────────┼─────────────────┤")

    for idx, f in enumerate(files, start=1):
        lines.append(f"│ {idx:<3} │ {f:<50} │ {detect_type(f):<15} │")

    lines.append("\n")
    return "\n".join(lines)

# =============================================================
# READ FILE CONTENT (NO MASK – FULL PUBLISH)
# =============================================================
def read_file(fullpath):
    fullpath_lower = fullpath.lower()

    if any(fullpath_lower.endswith(ext) for ext in TEXT_EXTENSIONS):
        try:
            with open(fullpath, "r", encoding="utf-8") as f:
                return f.read()
        except Exception as e:
            return f"[Không đọc được nội dung file – lỗi encoding: {e}]"

    return "[File binary / asset – không hiển thị nội dung]"

# =============================================================
# GENERATE FILE CONTENTS
# =============================================================
def generate_file_contents(files, root):
    lines = []
    lines.append("================================================================================")
    lines.append("                          NỘI DUNG CHI TIẾT CÁC FILE")
    lines.append("================================================================================\n")

    for idx, f in enumerate(files, start=1):
        fullpath = os.path.join(root, f)

        lines.append("################################################################################")
        lines.append(f"## FILE {idx}: {os.path.basename(f)}")
        lines.append(f"## Path: {f}")
        lines.append(f"## Type: {detect_type(f)}")
        lines.append("################################################################################\n")

        lines.append(read_file(fullpath))
        lines.append("\n\n")

    return "\n".join(lines)

# =============================================================
# MAIN
# =============================================================
def main():
    root = os.path.dirname(os.path.abspath(__file__))
    module_name = os.path.basename(root)

    now = datetime.datetime.now().strftime("%Y-%m-%d_%Hh%M")
    output_file = OUTPUT_NAME or f"{module_name}_DOCUMENTATION_{now}.txt"

    files = sorted(scan_files(root))

    output = []
    output.append(make_banner(module_name))
    output.append(generate_tree(files))
    output.append(generate_summary(files))
    output.append(generate_file_contents(files, root))

    with open(output_file, "w", encoding="utf-8") as f:
        f.write("\n".join(output))

    print(f"\nDONE! File generated: {output_file}")

if __name__ == "__main__":
    main()
