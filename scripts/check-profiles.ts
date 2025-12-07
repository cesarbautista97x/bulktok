import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkProfiles() {
    console.log('Checking profiles...')

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(10)

    if (error) {
        console.error('Error fetching profiles:', error)
        return
    }

    console.log(`Found ${profiles?.length || 0} profiles:`)
    profiles?.forEach(profile => {
        console.log(`- ${profile.email} (${profile.subscription_tier})`)
    })

    // Check auth users
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()

    if (usersError) {
        console.error('Error fetching users:', usersError)
        return
    }

    console.log(`\nFound ${users?.length || 0} auth users:`)
    users?.forEach(user => {
        console.log(`- ${user.email}`)
    })

    // Check for users without profiles
    const usersWithoutProfiles = users?.filter(user =>
        !profiles?.find(p => p.id === user.id)
    )

    if (usersWithoutProfiles && usersWithoutProfiles.length > 0) {
        console.log(`\n⚠️  Found ${usersWithoutProfiles.length} users without profiles:`)
        usersWithoutProfiles.forEach(user => {
            console.log(`- ${user.email} (ID: ${user.id})`)
        })

        console.log('\nCreating missing profiles...')
        for (const user of usersWithoutProfiles) {
            const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                    id: user.id,
                    email: user.email!,
                    full_name: user.user_metadata?.full_name || null,
                    avatar_url: user.user_metadata?.avatar_url || null,
                })

            if (insertError) {
                console.error(`Failed to create profile for ${user.email}:`, insertError)
            } else {
                console.log(`✓ Created profile for ${user.email}`)
            }
        }
    } else {
        console.log('\n✓ All users have profiles')
    }
}

checkProfiles().then(() => {
    console.log('\nDone!')
    process.exit(0)
}).catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
})
