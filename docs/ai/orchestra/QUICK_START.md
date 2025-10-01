# 🚀 CoreTet Orchestra - Quick Start

## Option 1: Use Terminal (Recommended)

Since you've already set your API key in Terminal, just run Orchestra from there:

```bash
cd /Users/exleymini/Apps/coretet-band/docs/ai/orchestra
python3 start_orchestra.py
```

## Option 2: Create .env file (For VSCode/Other Tools)

If you want to run from VSCode or other tools:

1. Create `.env` file in this directory:
```bash
cd /Users/exleymini/Apps/coretet-band/docs/ai/orchestra
cp .env.example .env
```

2. Edit `.env` and add your API key:
```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

3. Run Orchestra:
```bash
python3 start_orchestra.py
```

## First Steps

Once Orchestra starts, try these:

1. **Quick priority check**:
   ```
   What should I prioritize today?
   ```

2. **Review project status**:
   ```
   Review the comprehensive review and EOD status, then recommend next steps
   ```

3. **Start security work**:
   ```
   Help me enable RLS with Clerk-compatible JWT validation
   ```

4. **Clean up dead code**:
   ```
   Identify and help remove the dead Supabase Auth code
   ```

## Troubleshooting

- **"python not found"**: Use `python3` instead of `python` on Mac
- **"No module named anthropic"**: Run `pip3 install anthropic`
- **API key issues**: Ensure ANTHROPIC_API_KEY is set in Terminal or .env file
