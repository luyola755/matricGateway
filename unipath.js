document.addEventListener('DOMContentLoaded', () => {
    
    // --- Form Toggling Logic ---
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const switchLinks = document.querySelectorAll('.switch-link');
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');

    function switchView(target) {
        toggleBtns.forEach(btn => {
            if (btn.dataset.target === target) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        if (target === 'signup') {
            signinForm.classList.remove('active');
            signupForm.classList.add('active');
        } else {
            signupForm.classList.remove('active');
            signinForm.classList.add('active');
        }
    }

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.target));
    });

    switchLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(link.dataset.target);
        });
    });

    // --- Password Visibility Toggle Logic ---
    const togglePasswords = document.querySelectorAll('.toggle-password');

    togglePasswords.forEach(icon => {
        icon.addEventListener('click', function () {
            const input = this.previousElementSibling;
            
            if (input.type === 'password') {
                input.type = 'text';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            }
        });
    });

    // --- Helper Function for Button Loading ---
    function setLoading(btn, isLoading, text = 'Processing...') {
        if (isLoading) {
            btn.dataset.original = btn.innerHTML;
            btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${text}`;
            btn.disabled = true;
        } else {
            btn.innerHTML = btn.dataset.original;
            btn.disabled = false;
        }
    }

    // --- Handle Sign Up ---
    const registerForm = document.getElementById('registerForm');
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const grade = document.getElementById('signup-grade').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm').value;
        const submitBtn = registerForm.querySelector('.btn-primary');

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        setLoading(submitBtn, true, 'Creating Account...');

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, grade, password })
            });
            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                registerForm.reset();
                switchView('signin'); 
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert("Server error. Is the Python backend running?");
        } finally {
            setLoading(submitBtn, false);
        }
    });

    // --- Handle Sign In ---
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('signin-email').value;
        const password = document.getElementById('signin-password').value;
        const submitBtn = loginForm.querySelector('.btn-primary');

        setLoading(submitBtn, true, 'Signing In...');

        try {
            const response = await fetch('/api/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (response.ok) {
                alert(`Welcome back, ${data.user.name}! Login successful.`);
                loginForm.reset();
                
                // SAVE USER DATA TO BROWSER MEMORY (Crucial for Dashboard)
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userName', data.user.name);
                
                // Redirect to the Dashboard
                window.location.href = '/index'; 
                
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert("Server error. Is the Python backend running?");
        } finally {
            setLoading(submitBtn, false);
        }
    });
});