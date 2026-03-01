const fs = require("fs");
const path = require("path");

const files = [
  "src/app/(app)/(university-admin)/faculties/_components/faculty-columns.tsx",
  "src/app/(app)/(university-admin)/staff/_components/admin-columns.tsx",
  "src/app/(app)/(university-admin)/staff/_components/staff-columns.tsx",
  "src/app/(app)/(university-admin)/job-positions/job-positions-client.tsx",
  "src/app/(app)/(university-admin)/year-levels/_components/year-level-columns.tsx",
  "src/app/(app)/(university-admin)/degree-levels/_components/degree-level-columns.tsx",
  "src/app/(app)/(university-admin)/market/_components/product-columns.tsx",
  "src/app/(app)/(university-admin)/applications/_components/new-student-columns.tsx"
];

files.forEach((file) => {
  const fullPath = path.resolve(file);
  try {
    let content = fs.readFileSync(fullPath, "utf8");

    // Check if Tooltip is imported
    if (!content.includes('import { Tooltip }')) {
       // Insert after the last import
       const lastImportMatch = [...content.matchAll(/^import .*;$/gm)].pop();
       if (lastImportMatch) {
         const insertPos = lastImportMatch.index + lastImportMatch[0].length;
         content = content.slice(0, insertPos) + '\nimport { Tooltip } from "@/components/base/tooltip/tooltip";' + content.slice(insertPos);
       } else {
         content = 'import { Tooltip } from "@/components/base/tooltip/tooltip";\n' + content;
       }
    }

    // Replace O'chirish
    // <Button ... aria-label="O'chirish" />
    content = content.replace(/(<Button[^>]+aria-label="O'chirish"[^>]*\/>)/g, '<Tooltip title="O\'chirish" delay={200} color="error">\n            $1\n          </Tooltip>');

    // Replace Tahrirlash
    content = content.replace(/(<Button[^>]+aria-label="Tahrirlash"[^>]*\/>)/g, '<Tooltip title="Tahrirlash" delay={200} color="brand">\n            $1\n          </Tooltip>');

    // Replace Ko'rish if any
    content = content.replace(/(<Button[^>]+aria-label="Ko'rish"[^>]*\/>)/g, '<Tooltip title="Ko\'rish" delay={200} color="brand">\n            $1\n          </Tooltip>');

    fs.writeFileSync(fullPath, content);
    console.log("Updated", file);
  } catch(e) {
    console.log("Failed to process", file, e.message);
  }
});
