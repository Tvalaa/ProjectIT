const form = document.getElementById('form');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const errorMessage = document.getElementById('error-message');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.innerText = '';
    document.querySelectorAll('.input-wrapper').forEach(el => el.classList.remove('incorrect'));

    const errors = getLoginFormErrors(
        emailInput.value,
        passwordInput.value
    );

    if (errors.length > 0) {
        errorMessage.innerText = errors.join('. ');
        return;
    }

    await handleLogin();
});

function getLoginFormErrors(email, password) {
    const errors = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
        errors.push('Email is required');
        emailInput.parentElement.classList.add('incorrect');
    } else if (!emailRegex.test(email)) {
        errors.push('Invalid email format');
        emailInput.parentElement.classList.add('incorrect');
    }

    if (!password) {
        errors.push('Password is required');
        passwordInput.parentElement.classList.add('incorrect');
    }

    return errors;
}

async function handleLogin() {
    const loginData = {
        email: emailInput.value.trim(),
        password: passwordInput.value,
    };

    try {
        const response = await fetch('https://api.everrest.educata.dev/auth/sign_in', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login failed. Please check your credentials.');
        }


        localStorage.setItem('token', data.token);

        await fetchCurrentUserData();


        window.location.href = 'index.html';
    } catch (error) {
        errorMessage.innerText = error.message;
    }

}

async function fetchCurrentUserData() {
    const accessToken = localStorage.getItem('access_token');

    if (!accessToken) {
        console.error('No access token found.');
        return;
    }

    try {
        const response = await fetch('https://api.everrest.educata.dev/auth', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        });

        const userData = await response.json();

        if (response.ok) {
            console.log('User Data:', userData);
        } else {
            throw new Error('Failed to fetch user data.');
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => {
        if (input.parentElement.classList.contains('incorrect')) {
            input.parentElement.classList.remove('incorrect');
            errorMessage.innerText = '';
        }
    });
});