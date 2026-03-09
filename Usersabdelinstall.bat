@echo off
cd /d "C:UsersabdelDocumentsPlatformIOProjectsAI factory"
rmdir /s /q node_modules
del /f package-lock.json 2>nul
"C:Program Files
odejs
pm.cmd" install
