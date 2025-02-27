from flask import Flask

app = Flask(__name__)

@app.route("/")
def hello_world():
    return '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Portfolio</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Arial', sans-serif;
        }
        
        body {
            background-color: #f5f5f5;
            color: #333;
            line-height: 1.6;
        }
        
        header {
            background-color: #2c3e50;
            color: white;
            text-align: center;
            padding: 2rem 0;
            position: relative; /* Added for absolute positioning of profile picture */
        }
        
        header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }
        
        header p {
            font-size: 1.2rem;
            opacity: 0.8;
        }
        
        /* Profile Picture Styles */
        .profile-picture {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 120px;
            height: 120px;
            border-radius: 50%;
            overflow: hidden;
            border: 3px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        
        .profile-picture img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .container {
            max-width: 1100px;
            margin: 0 auto;
            padding: 0 2rem;
        }
        
        section {
            background-color: white;
            margin: 2rem 0;
            padding: 2rem;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        section h2 {
            color: #2c3e50;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #eee;
        }
        
        .about p {
            margin-bottom: 1rem;
        }
        
        .skills ul {
            display: flex;
            flex-wrap: wrap;
            list-style: none;
        }
        
        .skills li {
            background-color: #3498db;
            color: white;
            padding: 0.5rem 1rem;
            margin: 0.5rem;
            border-radius: 3px;
        }
        
        .projects .project {
            margin-bottom: 2rem;
        }
        
        .projects .project:last-child {
            margin-bottom: 0;
        }
        
        .projects h3 {
            color: #2c3e50;
            margin-bottom: 0.5rem;
        }
        
        .contact form {
            display: grid;
            gap: 1rem;
        }
        
        .contact label {
            font-weight: bold;
        }
        
        .contact input, .contact textarea {
            width: 100%;
            padding: 0.8rem;
            border: 1px solid #ddd;
            border-radius: 3px;
        }
        
        .contact button {
            background-color: #2c3e50;
            color: white;
            border: none;
            padding: 0.8rem 1.5rem;
            border-radius: 3px;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        
        .contact button:hover {
            background-color: #1a252f;
        }
        
        footer {
            background-color: #2c3e50;
            color: white;
            text-align: center;
            padding: 1.5rem 0;
            margin-top: 2rem;
        }
        
        @media (max-width: 768px) {
            header h1 {
                font-size: 2rem;
            }
            
            .skills ul {
                justify-content: center;
            }
            
            /* Responsive profile picture */
            .profile-picture {
                width: 80px;
                height: 80px;
                top: 15px;
                right: 15px;
            }
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>Joshua Ferreira</h1>
            <p>Web/Software Developer Student</p>
            <div class="profile-picture">
                <img src="Profile_Pic.jpg" alt="Joshua Ferreira">
            </div>
        </div>
    </header>
    
    <div class="container">
        <section class="about">
            <h2>About Me</h2>
            <p>My name is Joshua Ferreira, I am a student at Haverhill High School where I enroll in their CTE Program.</p>
            <p>I'm constantly learning new skills to stay up to date on software trends and technologies.</p>
        </section>
        
        <section class="skills">
            <h2>Skills</h2>
            <ul>
                <li>Python</li>
                <li>SQL</li>
                <li>Terminal (MacOS, Linux [Ubuntu])</li>
                <li>Flask</li>
                <li>Vue.js</li>
                <li>CakePHP</li>
                <li>Java</li>
                <li>Git & GitHub</li>
                <li>Linux (Ubuntu)</li>
            </ul>
        </section>
        
        <section class="projects">
            <h2>Projects</h2>
            <div class="project">
                <h3>Project 1: Anime-Aura-Roulette</h3>
                <p>A roulette style game made with Python where you spin for Dragon Ball Inspired auras, ranging from Super Saiyan to Ultra Instinct. You can view your inventory, whats missing, and more. Try here: <a href="https://github.com/Kointaker/Anime-Aura-Roulette">(https://github.com/Kointaker/Anime-Aura-Roulette)</a></p>
            </div>
            <div class="project">
                <h3>Project 2: To Do App</h3>
                <p>A To-Do list app made using Vue.js, where users can create tasks, see them, check them as completed, delete them, and more. Try here: <a href="https://github.com/Kointaker/TODO-App">(https://github.com/Kointaker/TODO-App)</a></p>
            </div>
            <div class="project">
                <h3>Project 3: Content Management System</h3>
                <p>A Content Management System blog website made using CakePHP, where users can create an account, login, post blogs, and more. Try here: <a href="https://github.com/Kointaker/cms">(https://github.com/Kointaker/cms)</a></p>
            </div>
        </section>
        
        <section class="contact">
            <h2>Contact Me</h2>
            <form>
                <div>
                    <label for="name">Name</label>
                    <input type="text" id="name" name="name" required>
                </div>
                <div>
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div>
                    <label for="message">Message</label>
                    <textarea id="message" name="message" rows="5" required></textarea>
                </div>
                <button type="submit">Send Message</button>
            </form>
        </section>
    </div>
    
    <footer>
        <div class="container">
            <p>&copy; 2025 Your Name. All Rights Reserved.</p>
        </div>
    </footer>
</body>
</html>'''



# flask run --host=0.0.0.0 to make the server publicly available on 
# all public ip's