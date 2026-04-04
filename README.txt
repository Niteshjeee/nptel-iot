NPTEL IoT Practice Hub - Rebuilt Mobile Version

What changed in this rebuild:
1. All JSON banks were normalized to one richer schema while preserving original fields.
2. A new data manifest was generated at /data/manifest.json.
3. Each question now includes app-friendly metadata such as:
   - variety_tag
   - practice_tag
   - focus_type
   - response_mode
   - marks
   - answer_display
   - has_code
   - has_image
   - tags
4. Each dataset now includes:
   - format_version
   - schema_version
   - slug
   - summary
   - exam_pattern
5. The UI is now mobile-first:
   - segmented pages instead of one long scroll page
   - working menu drawer
   - bottom navigation on phones
   - swipe-friendly question navigation
   - persistent practice history and resume mode
6. Visual questions stay hidden by default if matching image assets are not present.

Files to know:
- index.html
- styles.css
- app.js
- normalization_report.json
- /data/manifest.json
- /data/*_single.json

Static hosting:
- Upload the whole folder to GitHub
- Deploy on GitHub Pages / Cloudflare Pages as a static site
- No backend server is required for this build
