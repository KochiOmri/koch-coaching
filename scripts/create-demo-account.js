/**
 * CREATE DEMO ACCOUNT & DATA
 *
 * This script creates a demo client account and populates with sample data:
 * - Demo user: demo@koch-coaching.com / Demo2024!
 * - Sample exercises with descriptions
 * - Training program assigned to demo user
 * - Sample appointments and progress notes
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const DEMO_EMAIL = 'demo@koch-coaching.com';
const DEMO_PASSWORD = 'Demo2024!';
const DEMO_NAME = 'Demo Client';

// Sample exercises
const DEMO_EXERCISES = [
  {
    name: 'Standing March - Gait Integration',
    description: 'Functional Patterns standing march drill to integrate proper pelvic positioning during the gait cycle. Focus on maintaining neutral spine while alternating knee lifts.',
    category: 'Gait Training',
    video_url: 'https://www.youtube.com/watch?v=example1',
    thumbnail_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
    duration_minutes: 10,
    sets: 3,
    reps: 20,
    instructions: '1. Stand tall with neutral pelvis\n2. Lift knee to 90 degrees\n3. Maintain core engagement\n4. Alternate legs with control\n5. Focus on pelvic stability'
  },
  {
    name: 'Wall Plank with Contralateral Reach',
    description: 'Core stability drill emphasizing rotational control and anti-extension. This exercise integrates upper body reaching patterns while maintaining spinal position.',
    category: 'Core Stability',
    video_url: 'https://www.youtube.com/watch?v=example2',
    thumbnail_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    duration_minutes: 12,
    sets: 3,
    reps: 10,
    instructions: '1. Face wall in plank position\n2. Engage core and glutes\n3. Reach opposite arm forward\n4. Return to start position\n5. Alternate arms maintaining stability'
  },
  {
    name: 'Split Stance Romanian Deadlift',
    description: 'Posterior chain loading with proper hip hinge mechanics. Emphasizes hamstring and glute activation while maintaining spinal integrity.',
    category: 'Hip Mechanics',
    video_url: 'https://www.youtube.com/watch?v=example3',
    thumbnail_url: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400',
    duration_minutes: 15,
    sets: 3,
    reps: 12,
    instructions: '1. Split stance with slight forward lean\n2. Hinge at hips keeping spine neutral\n3. Lower weight toward front foot\n4. Drive through heel to return\n5. Feel stretch in hamstring'
  },
  {
    name: 'Kinetic Chain Integration Flow',
    description: 'Full body movement sequence combining the FP Big 4 patterns. Integrates standing, walking, rotation, and overhead patterns into one fluid movement.',
    category: 'Full Body Integration',
    video_url: 'https://www.youtube.com/watch?v=example4',
    thumbnail_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',
    duration_minutes: 20,
    sets: 2,
    reps: 8,
    instructions: '1. Start in standing position\n2. March in place with arm swings\n3. Add rotational component\n4. Reach overhead alternating sides\n5. Flow through sequence smoothly'
  },
  {
    name: 'Myofascial Ball Release - Hip Flexors',
    description: 'Self-myofascial release targeting hip flexor complex to improve hip extension and reduce anterior pelvic tilt.',
    category: 'Mobility & Release',
    video_url: 'https://www.youtube.com/watch?v=example5',
    thumbnail_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
    duration_minutes: 8,
    sets: 1,
    reps: 1,
    instructions: '1. Locate hip flexor attachment point\n2. Apply moderate pressure with ball\n3. Hold for 30-60 seconds\n4. Perform small movements\n5. Breathe deeply throughout'
  }
];

async function createDemoAccount() {
  console.log('🚀 Starting demo account creation...\n');

  try {
    // Step 1: Create demo user account
    console.log('👤 Creating demo user account...');
    const signupResponse = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        options: {
          data: {
            full_name: DEMO_NAME,
          },
        },
      }),
    });

    const signupData = await signupResponse.json();

    if (signupResponse.ok && signupData.user) {
      console.log('✅ Demo user created successfully!');
      console.log(`   Email: ${DEMO_EMAIL}`);
      console.log(`   User ID: ${signupData.user.id}`);

      const userId = signupData.user.id;
      const accessToken = signupData.session?.access_token;

      // Step 2: Ensure profile exists
      console.log('\n📝 Creating client profile...');
      const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          id: userId,
          name: DEMO_NAME,
          email: DEMO_EMAIL,
          phone: '+972 54-000-0000',
          status: 'active',
          joined_at: new Date().toISOString(),
        }),
      });

      if (profileResponse.ok) {
        console.log('✅ Client profile created!');
      } else {
        const profileError = await profileResponse.text();
        console.log(`⚠️  Profile creation: ${profileResponse.status} - May already exist`);
      }

      // Step 3: Add demo exercises
      console.log('\n💪 Adding demo exercises...');
      const exerciseIds = [];

      for (const exercise of DEMO_EXERCISES) {
        const exerciseResponse = await fetch(`${SUPABASE_URL}/rest/v1/exercises`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${accessToken}`,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(exercise),
        });

        if (exerciseResponse.ok) {
          const exerciseData = await exerciseResponse.json();
          exerciseIds.push(exerciseData[0].id);
          console.log(`   ✓ ${exercise.name}`);
        }
      }

      console.log(`✅ Added ${exerciseIds.length} exercises!`);

      // Step 4: Create training program
      if (exerciseIds.length > 0) {
        console.log('\n📋 Creating training program...');
        const programResponse = await fetch(`${SUPABASE_URL}/rest/v1/programs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${accessToken}`,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            name: '12-Week Foundation Program',
            description: 'Comprehensive biomechanics retraining focusing on gait optimization, postural correction, and movement integration using Functional Patterns methodology.',
            client_id: userId,
            duration_weeks: 12,
            frequency: '3x per week',
            status: 'active',
          }),
        });

        if (programResponse.ok) {
          const programData = await programResponse.json();
          console.log('✅ Training program created!');
          console.log(`   Program ID: ${programData[0].id}`);
          console.log(`   Name: ${programData[0].name}`);
        }
      }

      // Step 5: Add sample appointment
      console.log('\n📅 Adding sample appointment...');
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      lastWeek.setHours(10, 0, 0, 0);

      const appointmentResponse = await fetch(`${SUPABASE_URL}/rest/v1/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          client_id: userId,
          start_time: lastWeek.toISOString(),
          end_time: new Date(lastWeek.getTime() + 60 * 60 * 1000).toISOString(),
          type: 'Initial Assessment',
          status: 'completed',
          notes: 'Initial biomechanical assessment completed. Identified anterior pelvic tilt and gait dysfunction.',
        }),
      });

      if (appointmentResponse.ok) {
        console.log('✅ Sample appointment added!');
      }

      // Step 6: Add progress note
      console.log('\n📊 Adding progress note...');
      const progressResponse = await fetch(`${SUPABASE_URL}/rest/v1/session_notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          client_id: userId,
          session_date: lastWeek.toISOString().split('T')[0],
          session_type: 'Initial Assessment',
          subjective: 'Client reports chronic lower back discomfort (4/10 pain scale), worse after prolonged sitting.',
          objective: 'Anterior pelvic tilt observed. Left hip IR limitation. Gait analysis reveals excessive lumbar extension during stance phase.',
          assessment: 'Gait dysfunction with compensatory lumbar hyperextension. Hip flexor tightness contributing to pelvic tilt.',
          plan: 'Begin FP standing march protocol. Myofascial release hip flexors. Daily breathing exercises.',
          exercises_prescribed: 'Standing March 3x20, Hip Flexor Release 2min each side, Diaphragmatic breathing 5min',
          pain_score_before: 4,
          pain_score_after: 2,
        }),
      });

      if (progressResponse.ok) {
        console.log('✅ Progress note added!');
      }

      console.log('\n' + '='.repeat(60));
      console.log('🎉 DEMO ACCOUNT SETUP COMPLETE!');
      console.log('='.repeat(60));
      console.log('\n📧 Demo Login Credentials:');
      console.log(`   URL: https://koch-coaching.vercel.app/portal/login`);
      console.log(`   Email: ${DEMO_EMAIL}`);
      console.log(`   Password: ${DEMO_PASSWORD}`);
      console.log('\n✨ What was created:');
      console.log(`   ✓ Demo client account`);
      console.log(`   ✓ ${DEMO_EXERCISES.length} sample exercises`);
      console.log(`   ✓ 12-week training program`);
      console.log(`   ✓ Sample appointment (completed)`);
      console.log(`   ✓ Initial assessment notes`);
      console.log('\n🚀 Ready to share with friends!');
      console.log('='.repeat(60) + '\n');

    } else if (signupData.error) {
      if (signupData.error.message.includes('already registered')) {
        console.log('✅ Demo account already exists!');
        console.log('\n📧 Demo Login Credentials:');
        console.log(`   URL: https://koch-coaching.vercel.app/portal/login`);
        console.log(`   Email: ${DEMO_EMAIL}`);
        console.log(`   Password: ${DEMO_PASSWORD}`);
        console.log('\n✨ Account is ready to use!');
      } else {
        console.error('❌ Error creating user:', signupData.error.message);
        process.exit(1);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
createDemoAccount();
