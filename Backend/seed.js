const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Lab = require('./models/Lab');
const Material = require('./models/Material');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected for seeding'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    console.error('Make sure MongoDB is running. Start it with: mongod');
    process.exit(1);
  });

// Sample data
const users = [
  {
    username: 'student1',
    email: 'student1@example.com',
    password: '123456',
    role: 'student'
  },
  {
    username: 'professor1',
    email: 'professor1@example.com',
    password: '123456',
    role: 'professor'
  },
  {
    username: 'assistant1',
    email: 'assistant1@example.com',
    password: '123456',
    role: 'lab_assistant'
  }
];

const labs = [
  {
    id: 'computer-lab',
    name: 'Computer Lab',
    description: 'Computer hardware, networking equipment, and accessories',
    location: 'Building A, Floor 2',
    capacity: 40,
    image: '/images/compiler.png'
  },
  {
    id: 'physics-lab',
    name: 'Physics Lab',
    description: 'Physics instruments, measurement tools, and experimental apparatus',
    location: 'Building B, Floor 1',
    capacity: 35,
    image: '/images/ee.jpg'
  },
  {
    id: 'electronics-lab',
    name: 'Electronics Lab',
    description: 'Electronic components, circuit boards, and testing equipment',
    location: 'Building A, Floor 3',
    capacity: 30,
    image: '/images/machine.jpg'
  }
];

const getMaterials = (labObj) => {
  const computerLabMaterials = [
    {
      name: 'HDMI Cable',
      description: '6ft HDMI 2.0 cable for monitors and projectors',
      category: 'Equipment',
      tags: ['cable', 'connectivity', 'hdmi'],
      quantity: 25,
      minThreshold: 10,
      specifications: {
        Length: '6 feet',
        Version: 'HDMI 2.0',
        Connector: 'Type A'
      }
    },
    {
      name: 'USB Flash Drive 32GB',
      description: 'USB 3.0 flash drive for data storage',
      category: 'Equipment',
      tags: ['storage', 'usb', 'portable'],
      quantity: 50,
      minThreshold: 20
    },
    {
      name: 'Ethernet Cable Cat6',
      description: 'Category 6 ethernet cable for network connections',
      category: 'Equipment',
      tags: ['networking', 'cable', 'ethernet'],
      quantity: 40,
      minThreshold: 15
    },
    {
      name: 'Wireless Mouse',
      description: 'Ergonomic wireless optical mouse',
      category: 'Equipment',
      tags: ['peripheral', 'mouse', 'wireless'],
      quantity: 30,
      minThreshold: 10
    },
    {
      name: 'Keyboard',
      description: 'Standard wired USB keyboard',
      category: 'Equipment',
      tags: ['peripheral', 'keyboard', 'input'],
      quantity: 35,
      minThreshold: 15
    }
  ];

  const physicsLabMaterials = [
    {
      name: 'Digital Multimeter',
      description: 'Digital multimeter for voltage, current, and resistance measurement',
      category: 'Equipment',
      tags: ['measurement', 'electrical', 'testing'],
      quantity: 15,
      minThreshold: 5,
      specifications: {
        Type: 'Digital',
        Range: '0-1000V DC/AC'
      }
    },
    {
      name: 'Vernier Caliper',
      description: 'Precision measurement tool for internal and external dimensions',
      category: 'Tool',
      tags: ['measurement', 'precision', 'mechanical'],
      quantity: 20,
      minThreshold: 8
    },
    {
      name: 'Glass Beaker 250ml',
      description: 'Borosilicate glass beaker for experiments',
      category: 'Equipment',
      tags: ['glassware', 'laboratory', 'container'],
      quantity: 30,
      minThreshold: 10
    },
    {
      name: 'Spring Set',
      description: 'Set of springs with different spring constants',
      category: 'Equipment',
      tags: ['mechanics', 'springs', 'experiment'],
      quantity: 12,
      minThreshold: 5
    },
    {
      name: 'Thermometer Digital',
      description: 'Digital thermometer with LCD display',
      category: 'Equipment',
      tags: ['temperature', 'measurement', 'sensor'],
      quantity: 18,
      minThreshold: 8
    }
  ];

  const electronicsLabMaterials = [
    {
      name: '10kΩ Resistor Pack',
      description: 'Pack of 100 carbon film resistors, 10kΩ, 1/4W',
      category: 'Electronic Component',
      tags: ['resistor', 'passive', 'component'],
      quantity: 500,
      minThreshold: 100,
      specifications: {
        Resistance: '10kΩ',
        Power: '1/4W',
        Tolerance: '±5%'
      }
    },
    {
      name: 'Breadboard 830 Points',
      description: 'Solderless breadboard for circuit prototyping',
      category: 'Tool',
      tags: ['prototyping', 'breadboard', 'circuit'],
      quantity: 25,
      minThreshold: 10
    },
    {
      name: 'LED Pack (Red)',
      description: 'Pack of 50 red 5mm LEDs',
      category: 'Electronic Component',
      tags: ['led', 'indicator', 'light'],
      quantity: 200,
      minThreshold: 50
    },
    {
      name: 'Arduino Uno R3',
      description: 'Arduino Uno microcontroller board',
      category: 'Equipment',
      tags: ['microcontroller', 'arduino', 'programming'],
      quantity: 15,
      minThreshold: 5,
      specifications: {
        Microcontroller: 'ATmega328P',
        'Operating Voltage': '5V',
        'Digital I/O Pins': '14'
      }
    },
    {
      name: 'Capacitor Kit',
      description: 'Assorted ceramic and electrolytic capacitors',
      category: 'Electronic Component',
      tags: ['capacitor', 'passive', 'component'],
      quantity: 150,
      minThreshold: 50
    },
    {
      name: 'Jumper Wire Set',
      description: 'Male-to-male jumper wires for breadboard',
      category: 'Tool',
      tags: ['wire', 'connection', 'jumper'],
      quantity: 100,
      minThreshold: 30
    }
  ];

  if (labObj.id === 'computer-lab') return computerLabMaterials;
  if (labObj.id === 'physics-lab') return physicsLabMaterials;
  if (labObj.id === 'electronics-lab') return electronicsLabMaterials;
  return [];
};

// Seed function
const seedDatabase = async () => {
  try {
    console.log('🗑️  Clearing existing data...');
    console.log('⚠️  WARNING: This will DELETE all users, labs, and materials!');
    console.log('⚠️  Your signup credentials will be LOST!');
    console.log('');
    
    // Only delete labs and materials, preserve custom users
    await Lab.deleteMany({});
    await Material.deleteMany({});
    
    // Only delete seed users (not custom signups)
    const seedUsernames = ['student1', 'professor1', 'assistant1'];
    await User.deleteMany({ username: { $in: seedUsernames } });

    console.log('👥 Creating users...');
    const createdUsers = await User.create(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    console.log('🔬 Creating labs...');
    const createdLabs = await Lab.create(labs);
    console.log(`✅ Created ${createdLabs.length} labs`);

    console.log('📦 Creating materials...');
    let totalMaterials = 0;

    for (const lab of createdLabs) {
      const materials = getMaterials(lab);
      const materialsWithLab = materials.map(m => ({
        ...m,
        lab: lab._id,
        labId: lab.id
      }));
      await Material.create(materialsWithLab);
      totalMaterials += materialsWithLab.length;
      console.log(`✅ Created ${materialsWithLab.length} materials for ${lab.name}`);
    }

    console.log(`\n🎉 Database seeded successfully!`);
    console.log(`\n📊 Summary:`);
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Labs: ${createdLabs.length}`);
    console.log(`   Materials: ${totalMaterials}`);
    console.log(`\n🔑 Test Credentials:`);
    console.log(`   Student: username=student1, password=123456`);
    console.log(`   Professor: username=professor1, password=123456`);
    console.log(`   Lab Assistant: username=assistant1, password=123456`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed
seedDatabase();
