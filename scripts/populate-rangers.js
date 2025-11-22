// Run this in your browser console while on your app
// Make sure you're logged in to your app first

(async function populateRangers() {
    console.log('🌳 Starting to populate rangers database...\n');

    // Sample rangers data for Kenya's forest regions
    const rangers = [
        {
            name: 'John Kamau',
            phone_number: '+254712345678',
            lat: -1.2921, // Nairobi
            lon: 36.8219,
            status: 'available'
        },
        {
            name: 'Mary Wanjiku',
            phone_number: '+254723456789',
            lat: -0.0917, // Mount Kenya region
            lon: 37.0906,
            status: 'available'
        },
        {
            name: 'Peter Omondi',
            phone_number: '+254734567890',
            lat: -0.4833, // Aberdare Forest
            lon: 36.6500,
            status: 'available'
        },
        {
            name: 'Grace Akinyi',
            phone_number: '+254745678901',
            lat: -4.0435, // Tsavo region
            lon: 38.5597,
            status: 'available'
        },
        {
            name: 'David Kipchoge',
            phone_number: '+254756789012',
            lat: 0.5143, // Mau Forest
            lon: 35.2698,
            status: 'available'
        },
        {
            name: 'Sarah Njeri',
            phone_number: '+254767890123',
            lat: -1.4833, // Ngong Forest
            lon: 36.6500,
            status: 'available'
        },
        {
            name: 'James Mwangi',
            phone_number: '+254778901234',
            lat: -3.3869, // Amboseli region
            lon: 37.2561,
            status: 'available'
        },
        {
            name: 'Lucy Chebet',
            phone_number: '+254789012345',
            lat: 0.3556, // Kakamega Forest
            lon: 34.7519,
            status: 'available'
        },
        {
            name: 'Michael Otieno',
            phone_number: '+254790123456',
            lat: -0.0236, // Mount Elgon
            lon: 34.5590,
            status: 'available'
        },
        {
            name: 'Anne Wambui',
            phone_number: '+254701234567',
            lat: -1.1027, // Karura Forest
            lon: 36.8333,
            status: 'available'
        }
    ];

    try {
        // Get supabase client from window (should be available in your app)
        const { supabase } = await import('/src/integrations/supabase/client.ts');

        // Check if rangers already exist
        const { data: existingRangers } = await supabase
            .from('rangers')
            .select('id')
            .limit(1);

        if (existingRangers && existingRangers.length > 0) {
            console.log('⚠️  Rangers already exist in database.');
            console.log('   Current count:', existingRangers.length);
            return;
        }

        // Insert rangers
        console.log(`📝 Inserting ${rangers.length} rangers...\n`);

        const { data, error } = await supabase
            .from('rangers')
            .insert(rangers)
            .select();

        if (error) {
            console.error('❌ Error:', error);
            return;
        }

        console.log('✅ Successfully added rangers:\n');
        data?.forEach((ranger, index) => {
            console.log(`${index + 1}. ${ranger.name} - ${ranger.phone_number} (${ranger.status})`);
        });

        console.log(`\n🎉 Total rangers added: ${data?.length || 0}`);

    } catch (error) {
        console.error('❌ Error:', error);
        console.log('\n💡 Try running the SQL script in Supabase SQL Editor instead.');
    }
})();
