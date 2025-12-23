require('dotenv').config();
const mongoose = require('mongoose');
const Article = require('./models/Article');
const Student = require('./models/Students');

// Sample Articles Data
const sampleArticles = [
    {
        title: 'Getting Started with React Hooks',
        category: 'Web Development',
        subcategory: 'React',
        difficulty: 'Beginner',
        description: 'A comprehensive guide to understanding and using React Hooks like useState and useEffect.',
        readTime: 8,
        content: [
            {
                sectionTitle: 'What are Hooks?',
                sectionType: 'text',
                text: 'Hooks are functions that let you "hook into" React state and lifecycle features from function components. They do not work inside classes — they let you use React without classes.',
                order: 1
            },
            {
                sectionTitle: 'The useState Hook',
                sectionType: 'code',
                text: 'Here is how you declare a state variable called "count".',
                code: {
                    language: 'javascript',
                    snippet: 'import React, { useState } from "react";\n\nfunction Example() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div>\n      <p>You clicked {count} times</p>\n      <button onClick={() => setCount(count + 1)}>\n        Click me\n      </button>\n    </div>\n  );\n}',
                    output: 'Renders a button that increments a counter.'
                },
                order: 2
            }
        ],
        tags: ['React', 'JavaScript', 'Frontend', 'Hooks'],
        isFeatured: true
    },
    {
        title: 'Understanding Big O Notation',
        category: 'Algorithms',
        subcategory: 'Analysis',
        difficulty: 'Easy',
        description: 'Learn how to analyze the time and space complexity of algorithms using Big O notation.',
        readTime: 12,
        content: [
            {
                sectionTitle: 'Why Big O?',
                sectionType: 'text',
                text: 'Big O notation allows us to express the performance of an algorithm as the input size grows. It focuses on the worst-case scenario.',
                order: 1
            },
            {
                sectionTitle: 'Common Complexities',
                sectionType: 'table',
                text: '| Notation | Name | Example |\n|---|---|---|\n| O(1) | Constant | Array access |\n| O(n) | Linear | Loop |\n| O(n^2) | Quadratic | Nested Loop |',
                order: 2
            }
        ],
        tags: ['DSA', 'Algorithms', 'Complexity', 'Big O'],
        isFeatured: true
    },
    {
        title: 'Python List Comprehensions',
        category: 'Python',
        subcategory: 'Basics',
        difficulty: 'Beginner',
        description: 'Write cleaner and more Pythonic code using list comprehensions.',
        readTime: 5,
        content: [
            {
                sectionTitle: 'Basics',
                sectionType: 'code',
                text: 'List comprehensions provide a concise way to create lists.',
                code: {
                    language: 'python',
                    snippet: 'squares = [x**2 for x in range(10)]\nprint(squares)',
                    output: '[0, 1, 4, 9, 16, 25, 36, 49, 64, 81]'
                },
                order: 1
            }
        ],
        tags: ['Python', 'Tips', 'Coding'],
        isFeatured: false
    },
    {
        title: 'System Design: URL Shortener',
        category: 'System Design',
        subcategory: 'Design Problems',
        difficulty: 'Medium',
        description: 'How to design a scalable URL shortening service like TinyURL.',
        readTime: 15,
        content: [
            {
                sectionTitle: 'Requirements',
                sectionType: 'text',
                text: '1. Given a URL, our service should generate a shorter and unique alias of it.\n2. When users access a short link, our service should redirect them to the original link.',
                order: 1
            }
        ],
        tags: ['System Design', 'Scalability', 'Backend'],
        isFeatured: true
    },
    {
        title: 'Java Streams API',
        category: 'Java',
        subcategory: 'Advanced',
        difficulty: 'Medium',
        description: 'Master functional programming in Java using the Streams API.',
        readTime: 10,
        content: [
            {
                sectionTitle: 'Filtering and Mapping',
                sectionType: 'code',
                text: 'Streams allow you to process collections of objects in a functional style.',
                code: {
                    language: 'java',
                    snippet: 'List<String> names = Arrays.asList("John", "Jane", "Adam");\nList<String> jNames = names.stream()\n  .filter(name -> name.startsWith("J"))\n  .collect(Collectors.toList());',
                    output: '["John", "Jane"]'
                },
                order: 1
            }
        ],
        tags: ['Java', 'Streams', 'Functional'],
        isFeatured: false
    }
];

const seedArticles = async () => {
    try {
        console.log('Using Mongo URL:', process.env.MONGO_URL ? 'Defined' : 'Undefined');
        if (!process.env.MONGO_URL) {
            throw new Error('MONGO_URL not defined in env');
        }

        await mongoose.connect(process.env.MONGO_URL);
        console.log('✅ Connected to MongoDB');

        let author = await Student.findOne({ role: 'admin' });
        if (!author) {
            console.log('No admin found, trying any user...');
            author = await Student.findOne();
        }

        if (!author) {
            throw new Error('No users found in database to assign as author. Please register a user first.');
        }

        console.log(`Using author: ${author.name} (${author._id})`);

        let createdCount = 0;
        for (const articleData of sampleArticles) {
            const result = await Article.findOneAndUpdate(
                { title: articleData.title },
                {
                    ...articleData,
                    author: author._id,
                    status: 'published',
                    slug: articleData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                },
                { upsert: true, new: true, runValidators: true }
            );
            if (result) createdCount++;
            console.log(`Processed: ${articleData.title}`);
        }

        console.log(`✅ Seeding complete! Processed ${createdCount} articles.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

seedArticles();
