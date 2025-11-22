# Database Population Scripts

Scripts to populate your ForestGuard database with sample ranger data.

## 📋 What Gets Added

**10 Sample Rangers** across Kenya's major forest regions:

1. **John Kamau** - Nairobi Region
2. **Mary Wanjiku** - Mount Kenya Region
3. **Peter Omondi** - Aberdare Forest
4. **Grace Akinyi** - Tsavo Region
5. **David Kipchoge** - Mau Forest
6. **Sarah Njeri** - Ngong Forest
7. **James Mwangi** - Amboseli Region
8. **Lucy Chebet** - Kakamega Forest
9. **Michael Otieno** - Mount Elgon
10. **Anne Wambui** - Karura Forest

Each ranger has:
- ✅ Name
- ✅ Phone number (Kenyan format)
- ✅ GPS coordinates (lat/lon)
- ✅ Status: "available"

---

## 🚀 Method 1: SQL Script (RECOMMENDED)

**Easiest and most reliable method!**

### Steps:

1. Go to your Supabase Dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of `populate-rangers.sql`
5. Paste into the SQL editor
6. Click **Run** button
7. ✅ Done! Check the results below

### Verification:

The script automatically runs a SELECT query at the end to show all inserted rangers.

---

## 🌐 Method 2: Browser Console

**Run directly in your app's browser console**

### Steps:

1. Open your app in browser: `http://localhost:8080`
2. Make sure you're **logged in**
3. Open browser console (F12 or Right-click → Inspect → Console)
4. Copy the entire contents of `populate-rangers.js`
5. Paste into console and press Enter
6. ✅ Watch the console output!

### Expected Output:

```
🌳 Starting to populate rangers database...

📝 Inserting 10 rangers...

✅ Successfully added rangers:

1. John Kamau - +254712345678 (available)
2. Mary Wanjiku - +254723456789 (available)
...

🎉 Total rangers added: 10
```

---

## 🔧 Method 3: TypeScript Script

**For developers who want to run via Node.js**

### Prerequisites:

```bash
npm install @supabase/supabase-js
npm install tsx -g
```

### Steps:

1. Edit `populate-rangers.ts` and add your Supabase anon key
2. Run:
   ```bash
   tsx scripts/populate-rangers.ts
   ```

---

## ✅ Verify Rangers Were Added

### Option 1: Supabase Dashboard
1. Go to **Table Editor**
2. Select **rangers** table
3. You should see 10 rows

### Option 2: In Your App
1. Go to `/admin/incidents`
2. Click the **Auto-Assign Ranger** button (👤+)
3. If rangers exist, it will try to assign one

### Option 3: SQL Query
```sql
SELECT COUNT(*) FROM rangers;
-- Should return: 10

SELECT name, phone_number, status FROM rangers;
-- Shows all ranger details
```

---

## 🗑️ Clear Rangers (If Needed)

If you want to start fresh:

```sql
DELETE FROM rangers;
```

Then run the populate script again.

---

## 📝 Notes

- Rangers have **Kenyan phone numbers** (+254...)
- All rangers start with **"available"** status
- GPS coordinates are **real locations** in Kenya's forest regions
- Script checks for existing rangers to avoid duplicates
- Safe to run multiple times (won't create duplicates)

---

## 🆘 Troubleshooting

**"Rangers already exist"**
- Script detected existing rangers
- Delete them first if you want to re-populate

**"Permission denied"**
- Make sure you're logged in as admin
- Check RLS policies on rangers table

**"Function not found"**
- Use the SQL method instead
- It's the most reliable

---

## 🎯 Next Steps

After populating rangers:

1. ✅ Rangers appear in admin dashboard
2. ✅ Auto-assign feature works
3. ✅ Rangers can be assigned to incidents
4. ✅ Ranger mobile portal is ready for use

Happy forest guarding! 🌳🇰🇪
