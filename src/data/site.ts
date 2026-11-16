export const linkedin = 'https://www.linkedin.com/in/joshua-ferreira-mass';
export const github = 'https://github.com/Kointaker';
export const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const url = (path = '') => `${base}/${path.replace(/^\//, '')}`;

export const interests = [
  {
    title: 'Software engineering',
    short: 'Software',
    number: '01',
    description:
      'Turning everyday friction into useful tools. Native apps, thoughtful interfaces, and the systems behind them.',
    tools: 'Swift · SwiftUI · Vue.js · CakePHP',
  },
  {
    title: 'AI & machine learning',
    short: 'AI / ML',
    number: '02',
    description:
      'Looking beneath the output. Exploring how simple neurons, data, and modeled behavior fit together.',
    tools: 'Python · NumPy · Neural foundations',
  },
  {
    title: 'Game development',
    short: 'Game dev',
    number: '03',
    description:
      'A place for engineering and imagination to meet. Building simulations and making complex systems feel approachable.',
    tools: 'Godot · GDScript · Simulation',
  },
  {
    title: 'Information technology',
    short: 'IT',
    number: '04',
    description:
      'Starting with the person behind the problem. Troubleshooting devices, supporting users, and keeping things moving.',
    tools: 'Hardware · TeamDynamix · Technical support',
  },
];

export const traits = [
  {
    title: 'Curious by default',
    text: 'From a small NumPy neural network to a native macOS utility, I like exploring how things work by building them.',
    tag: 'Explore → understand',
  },
  {
    title: 'Hands-on in practice',
    text: 'Repairing Chromebooks, handling circuit boards, and prototyping clean energy ideas have taken my work beyond the screen.',
    tag: 'Understand → build',
  },
  {
    title: 'Adaptable across systems',
    text: 'I move between software, hardware, and customer-facing work. Each setting gives me a different way to approach a problem.',
    tag: 'Build → improve',
  },
  {
    title: 'Better together',
    text: 'Development planning at HydraCor, cybersecurity research with a team, and campus IT support have made collaboration part of how I work.',
    tag: 'Improve → share',
  },
];

export const experience = [
  {
    company: 'Merrimack College',
    role: 'IT Help Desk Technician',
    period: 'September – Present',
    year: 'Current',
    category: 'IT & support',
    current: true,
    description:
      'Helping faculty, staff, and students work through hardware, software, and account issues across campus.',
    points: [
      'Track, prioritize, and resolve service requests in TeamDynamix; escalate complex issues to the appropriate teams.',
      'Provide support by email, phone, and in person, including on-site troubleshooting and repairs.',
      'Assist with account setup, password resets, and hardware support.',
    ],
    tools: ['Technical support', 'TeamDynamix', 'Troubleshooting'],
  },
  {
    company: 'Bath & Body Works',
    role: 'Seasonal Retail Associate',
    period: 'October 2026 – Present',
    year: '2026',
    category: 'Customer experience',
    current: true,
    description:
      'Making busy store visits easier through attentive service, product guidance, and efficient checkout.',
    points: [
      'Help customers find products across fragrance, body care, and home collections.',
      'Support promotions and loyalty sign-ups while resolving customer questions.',
      'Use point-of-sale and mobile order software to keep store workflows moving.',
    ],
    tools: ['Communication', 'Customer service', 'Store operations'],
  },
  {
    company: 'MIT',
    role: 'Mass Clean Energy Intern',
    period: 'August 3 – 13, 2026',
    year: '2026',
    category: 'Engineering & invention',
    description:
      'Exploring sustainable technology through rapid invention sprints, research, and physical prototyping.',
    points: [
      'Collaborate with teams to understand stakeholder requirements and prioritize problems by impact and urgency.',
      'Move concepts from qualitative and quantitative research into physical prototypes.',
      'Present technical work through demonstrations and product pitches.',
    ],
    tools: ['Prototyping', 'Research', 'Team presentations'],
  },
  {
    company: 'Rapid Coatings Inc.',
    role: 'Manufacturing & Operations Intern',
    period: 'June – August 2025',
    year: '2025',
    category: 'Hardware & operations',
    description:
      'Working with printed circuit boards and the processes that move them through a production floor.',
    points: [
      'Manage shipping and receiving tasks and create work orders and job packets in company software.',
      'Track materials through production stages.',
      'Mask and unmask PCBs using tape, 3D-printed boots, and gel.',
    ],
    tools: ['PCB handling', 'Work orders', 'Material tracking'],
  },
  {
    company: 'Work-Based Learning Alliance',
    role: 'Cybersecurity Project Intern',
    period: 'October – November 2024',
    year: '2024',
    category: 'Security & collaboration',
    description:
      'Collaborating remotely on a cybersecurity research project and presenting findings to industry experts.',
    points: [
      'Research an assigned cybersecurity vulnerability with a project team.',
      'Participate in daily planning and communicate findings clearly.',
      'Meet project deadlines and contribute to a shared presentation.',
    ],
    tools: ['Cybersecurity research', 'Remote collaboration', 'Presentation'],
  },
  {
    company: 'HydraCor',
    role: 'Software Development Intern',
    period: 'July – August 2024',
    year: '2024',
    category: 'Software development',
    description:
      'Contributing to assigned development projects with Vue.js, CakePHP, and GitHub in a professional team.',
    points: [
      'Complete software development tasks using Vue.js and CakePHP.',
      'Manage version control through GitHub and collaborate with supervisors.',
      'Participate in refinement meetings and sprint planning adjustments.',
    ],
    tools: ['Vue.js', 'CakePHP', 'GitHub'],
  },
  {
    company: 'Haverhill Public Schools',
    role: 'Technical Support Intern',
    period: 'June – August 2023',
    year: '2023',
    category: 'Hardware & support',
    description:
      'Diagnosing and repairing Chromebooks while keeping device and component records organized.',
    points: [
      'Inspect, test, and repair hardware and software issues with coworkers.',
      'Document inventory, missing components, and parts used in repairs.',
      'Track broken equipment and report operational issues to supervisors.',
    ],
    tools: ['Chromebook repair', 'Device inventory', 'Diagnostics'],
  },
];

export const projects = [
  {
    slug: 'centurion',
    title: 'Centurion',
    subtitle: 'Less searching. Back to what matters.',
    category: 'Software',
    status: 'In development',
    type: 'Personal project · macOS utility',
    art: 'centurion',
    tags: ['Swift', 'SwiftUI', 'Gmail API'],
    repo: 'https://github.com/Kointaker/Centurion2',
    description:
      'A native macOS menu-bar utility that brings email verification codes within reach, with local processing and a focused interface.',
    purpose:
      'Switching to an inbox to find a verification code breaks the flow of a task. Centurion explores a quieter way to surface that code directly from the macOS menu bar.',
    contribution:
      'My repository brings together a SwiftUI menu-bar interface, Google OAuth authentication, a Gmail monitoring pipeline, and a deterministic code detector.',
    decisions: [
      {
        title: 'Keep processing local',
        text: 'Email text is normalized and inspected on the device. Credentials use macOS Keychain; detected codes stay in memory.',
      },
      {
        title: 'Recognize context, not just digits',
        text: 'The detector scores nearby verification phrases and penalizes likely dates, phone numbers, URLs, and order references.',
      },
      {
        title: 'Handle the messy edges',
        text: 'Overlapping Gmail checks and message deduplication account for delayed indexing. Transient failures use backoff.',
      },
    ],
    boundary:
      'The repository implements a development build with mock and Gmail workflows. Autofill is not implemented, and public distribution is not established.',
    next: 'Explore the implementation and documented setup on GitHub.',
  },
  {
    slug: 'fly-table-game',
    title: 'Fly Table Game',
    subtitle: 'Small characters. Connected systems.',
    category: 'Games',
    status: 'Private project',
    type: 'Personal project · Desktop spectator game',
    art: 'fly',
    tags: ['Godot', 'GDScript', 'Simulation'],
    description:
      'A desktop spectator game where configurable flies play tabletop games, bringing simulation, character behavior, and interactive inspection together.',
    purpose:
      'What happens when a tabletop game becomes something you observe? This project explores that idea through small characters, configurable personalities, and a shared simulated world.',
    contribution:
      'My private project combines rules-driven matches, a 3D presentation, a 2D overview, and an experimental neural dynamics layer in Godot.',
    decisions: [
      {
        title: 'One consistent simulation',
        text: 'A seeded simulation owns the match state. Different views observe the same match rather than creating competing versions of events.',
      },
      {
        title: 'Make behavior inspectable',
        text: 'Interactive inspection connects what a character is doing with modeled activity, making the underlying system part of the experience.',
      },
      {
        title: 'Separate model and interpretation',
        text: 'Experimental neural dynamics are coupled to authored game systems. This is a simulation experiment, not a claim of biological game understanding.',
      },
    ],
    boundary:
      'The project remains private. This is a high-level overview only; source, private assets, and downloads are not published here.',
    next: 'Ask me about the project on LinkedIn.',
  },
  {
    slug: 'neural-foundations',
    title: 'Neural Foundations',
    subtitle: 'Understanding the building blocks.',
    category: 'AI / ML',
    status: 'Archived learning project',
    type: 'Learning exercise · Feedforward network',
    art: 'neural',
    tags: ['Python', 'NumPy', 'Neural networks'],
    repo: 'https://github.com/Kointaker/neural_network_1',
    description:
      'A small Python exploration of neurons, sigmoid activation, and the flow of values through a feedforward network.',
    purpose:
      'Before treating a neural network as a black box, I wanted to understand the arithmetic inside it: weighted inputs, a bias, and an activation function.',
    contribution:
      'The repository contains a reusable neuron class and a small network with two inputs, two hidden neurons, and one output neuron, implemented with NumPy.',
    decisions: [
      {
        title: 'Build the neuron first',
        text: 'A dot product and bias feed into a sigmoid function, making each calculation easy to follow.',
      },
      {
        title: 'Compose a small network',
        text: 'Hidden neuron outputs become the inputs of the output neuron, demonstrating a forward pass.',
      },
      {
        title: 'Keep the scope honest',
        text: 'Weights and biases are fixed. The exercise does not implement training, backpropagation, or a predictive application.',
      },
    ],
    boundary: 'An archived educational exercise, not a trained model or production AI system.',
    next: 'Read the compact Python implementation on GitHub.',
  },
  {
    slug: 'tv-price-analysis',
    title: 'TV Price Analysis',
    subtitle: 'Finding patterns behind the price.',
    category: 'Data',
    status: 'Coursework',
    type: 'AP Statistics project · Data analysis',
    art: 'stats',
    tags: ['Python', 'pandas', 'SciPy', 'Plotly'],
    repo: 'https://github.com/Kointaker/AP-Stats-Project',
    description:
      'A statistics project exploring TV screen size and price, with data cleaning, regression, and visual comparisons by panel technology.',
    purpose:
      'Screen size is easy to compare, but it is only one part of a television’s price. This project examines the relationship while also looking at panel technology and resolution.',
    contribution:
      'The analysis script cleans a CSV dataset, identifies price outliers, calculates summary statistics, fits regressions, and creates interactive Plotly charts.',
    decisions: [
      {
        title: 'Clean before comparing',
        text: 'Currency strings become numeric prices, and minor panel technology labels are normalized.',
      },
      {
        title: 'Make assumptions visible',
        text: 'The IQR rule identifies price outliers excluded from the regression. Combined and per-technology fits offer different views of the data.',
      },
      {
        title: 'Show more than one view',
        text: 'Scatter plots, box plots, and grouped bars explore relationships and distributions without reducing the analysis to one number.',
      },
    ],
    boundary:
      'A coursework analysis of a supplied dataset. It does not establish causation or provide current shopping recommendations.',
    next: 'Explore the script and dataset on GitHub.',
  },
];
