const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Club = require('../models/Club');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Club.deleteMany({}),
      Event.deleteMany({}),
      Registration.deleteMany({}),
      Announcement.deleteMany({}),
      Notification.deleteMany({})
    ]);
    console.log('Cleared existing data.');

    // ============ USERS ============
    const passwordHash = await bcrypt.hash('password123', 12);

    const superAdmin = await User.create({
      name: 'Admin User',
      email: 'admin@college.edu',
      password: 'Admin@123',
      role: 'superAdmin',
      interests: ['Technology', 'AI & Machine Learning'],
      avatar: ''
    });

    const clubAdmins = await User.create([
      {
        name: 'Arjun Mehta',
        email: 'coding@college.edu',
        password: 'ClubAdmin@123',
        role: 'clubAdmin',
        interests: ['Coding', 'Technology', 'AI & Machine Learning'],
        avatar: ''
      },
      {
        name: 'Priya Sharma',
        email: 'priya@college.edu',
        password: 'ClubAdmin@123',
        role: 'clubAdmin',
        interests: ['Robotics', 'Technology'],
        avatar: ''
      },
      {
        name: 'Rahul Verma',
        email: 'rahul@college.edu',
        password: 'ClubAdmin@123',
        role: 'clubAdmin',
        interests: ['Photography', 'Cultural'],
        avatar: ''
      },
      {
        name: 'Ananya Patel',
        email: 'ananya@college.edu',
        password: 'ClubAdmin@123',
        role: 'clubAdmin',
        interests: ['Music', 'Dance', 'Cultural'],
        avatar: ''
      },
      {
        name: 'Vikram Singh',
        email: 'vikram@college.edu',
        password: 'ClubAdmin@123',
        role: 'clubAdmin',
        interests: ['Entrepreneurship', 'Technology'],
        avatar: ''
      },
      {
        name: 'Sneha Reddy',
        email: 'sneha@college.edu',
        password: 'ClubAdmin@123',
        role: 'clubAdmin',
        interests: ['Sports', 'Social Service'],
        avatar: ''
      },
      {
        name: 'Karthik Nair',
        email: 'karthik@college.edu',
        password: 'ClubAdmin@123',
        role: 'clubAdmin',
        interests: ['Literature', 'Cultural'],
        avatar: ''
      },
      {
        name: 'Deepika Joshi',
        email: 'deepika@college.edu',
        password: 'ClubAdmin@123',
        role: 'clubAdmin',
        interests: ['Social Service', 'Cultural'],
        avatar: ''
      }
    ]);

    const students = await User.create([
      {
        name: 'Riya Kapoor',
        email: 'student@college.edu',
        password: 'Student@123',
        role: 'student',
        interests: ['Technology', 'AI & Machine Learning', 'Coding'],
        avatar: ''
      },
      {
        name: 'Aditya Kumar',
        email: 'aditya@student.com',
        password: 'Student@123',
        role: 'student',
        interests: ['Coding', 'Robotics', 'Technology'],
        avatar: ''
      },
      {
        name: 'Meera Iyer',
        email: 'meera@student.com',
        password: 'Student@123',
        role: 'student',
        interests: ['Photography', 'Music', 'Dance'],
        avatar: ''
      },
      {
        name: 'Siddharth Das',
        email: 'siddharth@student.com',
        password: 'Student@123',
        role: 'student',
        interests: ['Entrepreneurship', 'Technology', 'Coding'],
        avatar: ''
      },
      {
        name: 'Kavya Nair',
        email: 'kavya@student.com',
        password: 'Student@123',
        role: 'student',
        interests: ['Literature', 'Cultural', 'Social Service'],
        avatar: ''
      },
      {
        name: 'Rohan Gupta',
        email: 'rohan@student.com',
        password: 'Student@123',
        role: 'student',
        interests: ['Sports', 'Music', 'Photography'],
        avatar: ''
      },
      {
        name: 'Ishita Banerjee',
        email: 'ishita@student.com',
        password: 'password123',
        role: 'student',
        interests: ['AI & Machine Learning', 'Robotics', 'Technology'],
        avatar: ''
      },
      {
        name: 'Nikhil Rao',
        email: 'nikhil@student.com',
        password: 'password123',
        role: 'student',
        interests: ['Dance', 'Cultural', 'Music'],
        avatar: ''
      }
    ]);

    console.log(`Created ${1 + clubAdmins.length + students.length} users.`);

    // ============ CLUBS ============
    const clubs = await Club.create([
      {
        name: 'Coding Club',
        description: 'The Coding Club is a vibrant community of passionate programmers and developers. We organize workshops, hackathons, coding challenges, and mentorship sessions to help students sharpen their programming skills. Whether you\'re a beginner learning your first language or an experienced developer building projects, there\'s a place for you here.',
        shortDescription: 'Learn, code, and build amazing software together.',
        category: 'Coding',
        admin: clubAdmins[0]._id,
        members: [
          { user: clubAdmins[0]._id },
          { user: students[0]._id },
          { user: students[1]._id },
          { user: students[3]._id }
        ],
        tags: ['Programming', 'Web Development', 'DSA', 'Hackathon', 'Coding'],
        status: 'active',
        featured: true,
        contactEmail: 'codingclub@campus.edu'
      },
      {
        name: 'AI & Machine Learning Club',
        description: 'Explore the fascinating world of Artificial Intelligence and Machine Learning. Our club brings together students interested in neural networks, deep learning, natural language processing, computer vision, and data science. We host paper reading sessions, project showcases, Kaggle competitions, and industry expert talks.',
        shortDescription: 'Pushing boundaries in AI, ML, and data science.',
        category: 'AI & Machine Learning',
        admin: clubAdmins[0]._id,
        members: [
          { user: clubAdmins[0]._id },
          { user: students[0]._id },
          { user: students[6]._id },
          { user: students[1]._id }
        ],
        tags: ['AI', 'Machine Learning', 'Deep Learning', 'Data Science', 'NLP', 'Technology'],
        status: 'active',
        featured: true,
        contactEmail: 'aiml@campus.edu'
      },
      {
        name: 'Robotics Club',
        description: 'Design, build, and program robots! The Robotics Club is where engineering meets creativity. From line-following bots to drone projects, we work on cutting-edge robotics projects. Participate in national and international robotics competitions and gain hands-on experience with embedded systems, Arduino, Raspberry Pi, and more.',
        shortDescription: 'Building the future, one robot at a time.',
        category: 'Robotics',
        admin: clubAdmins[1]._id,
        members: [
          { user: clubAdmins[1]._id },
          { user: students[1]._id },
          { user: students[6]._id }
        ],
        tags: ['Robotics', 'Arduino', 'IoT', 'Engineering', 'Embedded Systems', 'Technology'],
        status: 'active',
        featured: true,
        contactEmail: 'robotics@campus.edu'
      },
      {
        name: 'Photography Club',
        description: 'Capture the world through your lens. The Photography Club is a creative community for photography enthusiasts of all levels. We organize photo walks, editing workshops, exhibitions, and photography competitions. Learn composition, lighting, post-processing, and develop your unique visual storytelling style.',
        shortDescription: 'Frame the world, one shot at a time.',
        category: 'Photography',
        admin: clubAdmins[2]._id,
        members: [
          { user: clubAdmins[2]._id },
          { user: students[2]._id },
          { user: students[5]._id }
        ],
        tags: ['Photography', 'Editing', 'Visual Arts', 'Creative'],
        status: 'active',
        featured: true,
        contactEmail: 'photo@campus.edu'
      },
      {
        name: 'Music Club',
        description: 'Unite through the universal language of music. Whether you sing, play an instrument, produce beats, or simply love music, this club is your stage. We organize jam sessions, open mics, band formations, music production workshops, and perform at college festivals.',
        shortDescription: 'Where melodies meet, and rhythms unite.',
        category: 'Music',
        admin: clubAdmins[3]._id,
        members: [
          { user: clubAdmins[3]._id },
          { user: students[2]._id },
          { user: students[5]._id },
          { user: students[7]._id }
        ],
        tags: ['Music', 'Singing', 'Instruments', 'Band', 'Performance'],
        status: 'active',
        featured: false,
        contactEmail: 'music@campus.edu'
      },
      {
        name: 'Entrepreneurship Cell',
        description: 'Turn ideas into ventures. The E-Cell fosters entrepreneurial spirit through startup workshops, pitch competitions, business plan challenges, and networking events with industry leaders and investors. Build your business acumen and connect with like-minded innovators.',
        shortDescription: 'Fueling innovation and startup culture on campus.',
        category: 'Entrepreneurship',
        admin: clubAdmins[4]._id,
        members: [
          { user: clubAdmins[4]._id },
          { user: students[3]._id },
          { user: students[0]._id }
        ],
        tags: ['Entrepreneurship', 'Startup', 'Business', 'Innovation', 'Pitch'],
        status: 'active',
        featured: true,
        contactEmail: 'ecell@campus.edu'
      },
      {
        name: 'Sports Club',
        description: 'Stay fit, compete, and excel in sports. The Sports Club manages all campus sporting activities including cricket, football, basketball, badminton, athletics, and chess. We organize inter-college tournaments, fitness boot camps, and sports day events.',
        shortDescription: 'Play hard, compete harder, champion the spirit.',
        category: 'Sports',
        admin: clubAdmins[5]._id,
        members: [
          { user: clubAdmins[5]._id },
          { user: students[5]._id },
          { user: students[1]._id }
        ],
        tags: ['Sports', 'Cricket', 'Football', 'Basketball', 'Fitness'],
        status: 'active',
        featured: false,
        contactEmail: 'sports@campus.edu'
      },
      {
        name: 'Literary Society',
        description: 'For the love of words. The Literary Society celebrates literature, creative writing, poetry, debating, and public speaking. Join us for book clubs, poetry slams, creative writing workshops, essay competitions, and literary festivals. Express yourself through the power of words.',
        shortDescription: 'Where words come alive and ideas take flight.',
        category: 'Literature',
        admin: clubAdmins[6]._id,
        members: [
          { user: clubAdmins[6]._id },
          { user: students[4]._id },
          { user: students[7]._id }
        ],
        tags: ['Literature', 'Writing', 'Poetry', 'Debate', 'Public Speaking'],
        status: 'active',
        featured: false,
        contactEmail: 'literary@campus.edu'
      }
    ]);

    console.log(`Created ${clubs.length} clubs.`);

    // Update club admins with managed clubs
    await User.findByIdAndUpdate(clubAdmins[0]._id, { managedClub: clubs[0]._id, joinedClubs: [clubs[0]._id, clubs[1]._id] });
    await User.findByIdAndUpdate(clubAdmins[1]._id, { managedClub: clubs[2]._id, joinedClubs: [clubs[2]._id] });
    await User.findByIdAndUpdate(clubAdmins[2]._id, { managedClub: clubs[3]._id, joinedClubs: [clubs[3]._id] });
    await User.findByIdAndUpdate(clubAdmins[3]._id, { managedClub: clubs[4]._id, joinedClubs: [clubs[4]._id] });
    await User.findByIdAndUpdate(clubAdmins[4]._id, { managedClub: clubs[5]._id, joinedClubs: [clubs[5]._id] });
    await User.findByIdAndUpdate(clubAdmins[5]._id, { managedClub: clubs[6]._id, joinedClubs: [clubs[6]._id] });
    await User.findByIdAndUpdate(clubAdmins[6]._id, { managedClub: clubs[7]._id, joinedClubs: [clubs[7]._id] });

    // Update students with joined clubs
    await User.findByIdAndUpdate(students[0]._id, { joinedClubs: [clubs[0]._id, clubs[1]._id, clubs[5]._id] });
    await User.findByIdAndUpdate(students[1]._id, { joinedClubs: [clubs[0]._id, clubs[1]._id, clubs[2]._id, clubs[6]._id] });
    await User.findByIdAndUpdate(students[2]._id, { joinedClubs: [clubs[3]._id, clubs[4]._id] });
    await User.findByIdAndUpdate(students[3]._id, { joinedClubs: [clubs[0]._id, clubs[5]._id] });
    await User.findByIdAndUpdate(students[4]._id, { joinedClubs: [clubs[7]._id] });
    await User.findByIdAndUpdate(students[5]._id, { joinedClubs: [clubs[3]._id, clubs[4]._id, clubs[6]._id] });
    await User.findByIdAndUpdate(students[6]._id, { joinedClubs: [clubs[1]._id, clubs[2]._id] });
    await User.findByIdAndUpdate(students[7]._id, { joinedClubs: [clubs[4]._id, clubs[7]._id] });

    // ============ EVENTS ============
    const now = new Date();
    const futureDate = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const pastDate = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const events = await Event.create([
      {
        title: 'Full Stack Development Bootcamp',
        description: 'An intensive 2-day bootcamp covering React, Node.js, Express, and MongoDB. Build a complete web application from scratch. Suitable for beginners with basic programming knowledge. Laptops required. Lunch and refreshments provided.',
        club: clubs[0]._id,
        category: 'Coding',
        tags: ['Web Development', 'React', 'Node.js', 'MERN', 'Coding', 'Technology'],
        date: futureDate(7),
        startTime: '09:00',
        endTime: '17:00',
        venue: 'Computer Science Lab, Block A',
        capacity: 60,
        registeredCount: 34,
        registrationDeadline: futureDate(5),
        eligibility: 'Open to all students with basic programming knowledge',
        status: 'upcoming',
        featured: true
      },
      {
        title: 'AI Innovation Workshop',
        description: 'Hands-on workshop on building AI applications using Python, TensorFlow, and OpenAI APIs. Learn to create intelligent chatbots, image classifiers, and recommendation systems. No prior ML experience required.',
        club: clubs[1]._id,
        category: 'AI & Machine Learning',
        tags: ['AI', 'Machine Learning', 'Python', 'TensorFlow', 'Deep Learning', 'Technology'],
        date: futureDate(12),
        startTime: '10:00',
        endTime: '16:00',
        venue: 'AI Research Lab, Block B',
        capacity: 45,
        registeredCount: 28,
        registrationDeadline: futureDate(10),
        eligibility: 'Open to all students',
        status: 'upcoming',
        featured: true
      },
      {
        title: 'Robotics Challenge 2024',
        description: 'Annual inter-college robotics competition. Design and build a robot that can navigate an obstacle course, pick up objects, and complete timed challenges. Teams of 3-4 members. Prizes worth ₹50,000.',
        club: clubs[2]._id,
        category: 'Robotics',
        tags: ['Robotics', 'Competition', 'Engineering', 'Arduino', 'Technology'],
        date: futureDate(20),
        startTime: '08:00',
        endTime: '18:00',
        venue: 'Engineering Auditorium',
        capacity: 100,
        registeredCount: 56,
        registrationDeadline: futureDate(15),
        eligibility: 'Teams of 3-4 students',
        status: 'upcoming',
        featured: true
      },
      {
        title: 'Campus Photography Walk',
        description: 'Explore the beauty of our campus through a guided photography walk. Learn composition techniques, lighting tricks, and mobile photography tips from professional photographers. All devices welcome — DSLR, mirrorless, or smartphone.',
        club: clubs[3]._id,
        category: 'Photography',
        tags: ['Photography', 'Creative', 'Visual Arts', 'Campus'],
        date: futureDate(5),
        startTime: '06:00',
        endTime: '09:00',
        venue: 'Meet at Main Gate',
        capacity: 30,
        registeredCount: 18,
        registrationDeadline: futureDate(3),
        eligibility: 'Open to all students',
        status: 'upcoming',
        featured: false
      },
      {
        title: 'Open Mic Night',
        description: 'Show off your talent! Sing, play an instrument, do stand-up comedy, recite poetry, or perform any act on stage. Everyone gets 5 minutes to shine. Supportive audience guaranteed. Refreshments available.',
        club: clubs[4]._id,
        category: 'Music',
        tags: ['Music', 'Performance', 'Singing', 'Open Mic', 'Cultural'],
        date: futureDate(3),
        startTime: '18:00',
        endTime: '21:00',
        venue: 'Open Air Theatre',
        capacity: 200,
        registeredCount: 145,
        registrationDeadline: futureDate(2),
        eligibility: 'Open to all students',
        status: 'upcoming',
        featured: true
      },
      {
        title: 'Startup Pitch Night',
        description: 'Present your startup idea to a panel of investors, mentors, and industry professionals. Get feedback, mentorship opportunities, and potentially win seed funding. Top 3 pitches receive cash prizes and incubation support.',
        club: clubs[5]._id,
        category: 'Entrepreneurship',
        tags: ['Startup', 'Pitch', 'Business', 'Innovation', 'Entrepreneurship'],
        date: futureDate(14),
        startTime: '17:00',
        endTime: '20:00',
        venue: 'Seminar Hall, Block C',
        capacity: 80,
        registeredCount: 42,
        registrationDeadline: futureDate(10),
        eligibility: 'Teams or individuals with a business idea',
        status: 'upcoming',
        featured: true
      },
      {
        title: 'Inter-College Cricket Tournament',
        description: 'Annual T20 cricket tournament featuring 8 colleges. Three-day event with group stages, semi-finals, and the grand finale. Trophies, medals, and Man of the Match awards for each game.',
        club: clubs[6]._id,
        category: 'Sports',
        tags: ['Cricket', 'Sports', 'Tournament', 'Competition'],
        date: futureDate(25),
        startTime: '07:00',
        endTime: '19:00',
        venue: 'University Cricket Ground',
        capacity: 120,
        registeredCount: 88,
        registrationDeadline: futureDate(20),
        eligibility: 'College students with valid ID',
        status: 'upcoming',
        featured: false
      },
      {
        title: 'Poetry Slam',
        description: 'Express yourself through spoken word and poetry. Competitive poetry performance event where participants recite original poems. Judged on content, creativity, and delivery. Cash prizes for top 3 performers.',
        club: clubs[7]._id,
        category: 'Literature',
        tags: ['Poetry', 'Literature', 'Performance', 'Creative Writing', 'Cultural'],
        date: futureDate(8),
        startTime: '16:00',
        endTime: '19:00',
        venue: 'Library Auditorium',
        capacity: 50,
        registeredCount: 22,
        registrationDeadline: futureDate(6),
        eligibility: 'Open to all students',
        status: 'upcoming',
        featured: false
      },
      {
        title: 'Competitive Programming Contest',
        description: 'Test your algorithmic skills in this 3-hour coding contest. Problems ranging from easy to expert difficulty. Solve data structure and algorithm challenges. Top performers get internship referrals.',
        club: clubs[0]._id,
        category: 'Coding',
        tags: ['Competitive Programming', 'DSA', 'Algorithms', 'Coding', 'Technology'],
        date: futureDate(10),
        startTime: '14:00',
        endTime: '17:00',
        venue: 'Computer Science Lab, Block A',
        capacity: 80,
        registeredCount: 52,
        registrationDeadline: futureDate(8),
        eligibility: 'Open to all students',
        status: 'upcoming',
        featured: false
      },
      {
        title: 'Data Science with Python',
        description: 'Workshop on data analysis, visualization, and machine learning using Python libraries — Pandas, NumPy, Matplotlib, Seaborn, and Scikit-learn. Hands-on with real-world datasets.',
        club: clubs[1]._id,
        category: 'AI & Machine Learning',
        tags: ['Data Science', 'Python', 'Machine Learning', 'AI', 'Technology'],
        date: futureDate(18),
        startTime: '10:00',
        endTime: '15:00',
        venue: 'Smart Classroom, Block D',
        capacity: 50,
        registeredCount: 31,
        registrationDeadline: futureDate(15),
        eligibility: 'Basic Python knowledge recommended',
        status: 'upcoming',
        featured: false
      },
      // Past events
      {
        title: 'Hackathon 2024',
        description: '24-hour hackathon where teams built innovative solutions for social good. Over 50 teams participated.',
        club: clubs[0]._id,
        category: 'Coding',
        tags: ['Hackathon', 'Coding', 'Innovation', 'Technology'],
        date: pastDate(15),
        startTime: '09:00',
        endTime: '09:00',
        venue: 'Main Auditorium',
        capacity: 200,
        registeredCount: 186,
        registrationDeadline: pastDate(20),
        eligibility: 'Teams of 2-4 students',
        status: 'completed',
        featured: false
      },
      {
        title: 'ML Paper Reading Session',
        description: 'Discussion of landmark ML papers including Attention Is All You Need, ResNet, and GPT architecture.',
        club: clubs[1]._id,
        category: 'AI & Machine Learning',
        tags: ['Machine Learning', 'Research', 'AI', 'Technology'],
        date: pastDate(5),
        startTime: '15:00',
        endTime: '17:00',
        venue: 'AI Research Lab, Block B',
        capacity: 30,
        registeredCount: 24,
        registrationDeadline: pastDate(7),
        eligibility: 'Open to all',
        status: 'completed',
        featured: false
      }
    ]);

    console.log(`Created ${events.length} events.`);

    // ============ REGISTRATIONS ============
    const registrations = await Registration.create([
      { student: students[0]._id, event: events[0]._id, attendanceStatus: 'registered' },
      { student: students[1]._id, event: events[0]._id, attendanceStatus: 'registered' },
      { student: students[3]._id, event: events[0]._id, attendanceStatus: 'registered' },
      { student: students[0]._id, event: events[1]._id, attendanceStatus: 'registered' },
      { student: students[6]._id, event: events[1]._id, attendanceStatus: 'registered' },
      { student: students[1]._id, event: events[2]._id, attendanceStatus: 'registered' },
      { student: students[6]._id, event: events[2]._id, attendanceStatus: 'registered' },
      { student: students[2]._id, event: events[3]._id, attendanceStatus: 'registered' },
      { student: students[5]._id, event: events[3]._id, attendanceStatus: 'registered' },
      { student: students[2]._id, event: events[4]._id, attendanceStatus: 'registered' },
      { student: students[7]._id, event: events[4]._id, attendanceStatus: 'registered' },
      { student: students[5]._id, event: events[4]._id, attendanceStatus: 'registered' },
      { student: students[3]._id, event: events[5]._id, attendanceStatus: 'registered' },
      { student: students[0]._id, event: events[5]._id, attendanceStatus: 'registered' },
      { student: students[5]._id, event: events[6]._id, attendanceStatus: 'registered' },
      { student: students[1]._id, event: events[6]._id, attendanceStatus: 'registered' },
      // Past event attendance
      { student: students[0]._id, event: events[10]._id, attendanceStatus: 'present' },
      { student: students[1]._id, event: events[10]._id, attendanceStatus: 'present' },
      { student: students[3]._id, event: events[10]._id, attendanceStatus: 'absent' },
      { student: students[0]._id, event: events[11]._id, attendanceStatus: 'present' },
      { student: students[6]._id, event: events[11]._id, attendanceStatus: 'present' },
    ]);

    // Update saved events for demo student
    await User.findByIdAndUpdate(students[0]._id, {
      savedEvents: [events[2]._id, events[4]._id, events[5]._id]
    });

    console.log(`Created ${registrations.length} registrations.`);

    // ============ ANNOUNCEMENTS ============
    const announcements = await Announcement.create([
      {
        club: clubs[0]._id,
        title: 'Full Stack Bootcamp Registration Open!',
        content: 'Registration for our upcoming Full Stack Development Bootcamp is now open. Limited seats available — register early to secure your spot. No prerequisites other than basic programming knowledge. Laptops are required.',
        priority: 'high',
        author: clubAdmins[0]._id
      },
      {
        club: clubs[1]._id,
        title: 'AI Workshop Materials Ready',
        content: 'Pre-workshop materials and setup instructions for the AI Innovation Workshop have been uploaded. Please install Python 3.10+, TensorFlow, and Jupyter Notebook before attending. Links in the club resources section.',
        priority: 'normal',
        author: clubAdmins[0]._id
      },
      {
        club: clubs[2]._id,
        title: 'Robotics Challenge Team Formation',
        content: 'Looking for teammates for the upcoming Robotics Challenge? Post your skills and interests in the club forum. Teams of 3-4 members. Deadline for team registration is approaching fast!',
        priority: 'high',
        author: clubAdmins[1]._id
      },
      {
        club: clubs[5]._id,
        title: 'New Mentorship Program Launched',
        content: 'We are excited to announce our new Startup Mentorship Program! Get paired with experienced entrepreneurs and industry mentors. Applications open until next week.',
        priority: 'normal',
        author: clubAdmins[4]._id
      },
      {
        club: clubs[4]._id,
        title: 'Open Mic Night — Performer Sign-ups',
        content: 'Want to perform at this week\'s Open Mic Night? Sign up through the event registration. All forms of performance welcome — singing, instruments, comedy, poetry, dance.',
        priority: 'normal',
        author: clubAdmins[3]._id
      },
      {
        club: clubs[0]._id,
        title: 'Competitive Programming Practice Sessions',
        content: 'Weekly CP practice sessions every Wednesday at 6 PM in the CS Lab. We solve problems from Codeforces, LeetCode, and AtCoder together. All levels welcome.',
        priority: 'low',
        author: clubAdmins[0]._id
      }
    ]);

    console.log(`Created ${announcements.length} announcements.`);

    // ============ NOTIFICATIONS ============
    const notifs = await Notification.create([
      {
        recipient: students[0]._id,
        type: 'welcome',
        title: 'Welcome to ClubConnect! 🎉',
        message: 'Start by exploring clubs and events that match your interests.',
        read: true
      },
      {
        recipient: students[0]._id,
        type: 'event_registration',
        title: 'Registration Confirmed! ✅',
        message: 'You are registered for "Full Stack Development Bootcamp" by Coding Club.',
        relatedEvent: events[0]._id,
        relatedClub: clubs[0]._id,
        read: true
      },
      {
        recipient: students[0]._id,
        type: 'event_created',
        title: 'New Event: AI Innovation Workshop',
        message: 'AI & Machine Learning Club has posted a new event: "AI Innovation Workshop".',
        relatedEvent: events[1]._id,
        relatedClub: clubs[1]._id,
        read: false
      },
      {
        recipient: students[0]._id,
        type: 'club_announcement',
        title: '📢 Coding Club: Full Stack Bootcamp Registration Open!',
        message: 'Registration for our upcoming Full Stack Development Bootcamp is now open. Limited seats available.',
        relatedClub: clubs[0]._id,
        read: false
      },
      {
        recipient: students[0]._id,
        type: 'event_created',
        title: 'New Event: Startup Pitch Night',
        message: 'Entrepreneurship Cell has posted a new event: "Startup Pitch Night".',
        relatedEvent: events[5]._id,
        relatedClub: clubs[5]._id,
        read: false
      }
    ]);

    console.log(`Created ${notifs.length} notifications.`);

    console.log('\n✅ Database seeded successfully!\n');
    console.log('Demo Accounts:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Student:     student@clubconnect.com / password123');
    console.log('Club Admin:  arjun@clubconnect.com   / password123');
    console.log('Super Admin: admin@clubconnect.com   / password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
