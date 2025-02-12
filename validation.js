const form = document.getElementById('form');
const firstnameInput = document.getElementById('firstname-input');
const lastnameInput = document.getElementById('lastname-input');
const ageInput = document.getElementById('age-input');
const addressInput = document.getElementById('address-input');
const phoneInput = document.getElementById('phone-input');
const zipcodeInput = document.getElementById('zipcode-input');
const avatarInput = document.getElementById('avatar-input');
const genderInput = document.getElementById('gender-input');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const repeatPasswordInput = document.getElementById('repeat-password-input');
const errorMessage = document.getElementById('error-message');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.innerText = '';
    
    document.querySelectorAll('.input-wrapper').forEach(el => el.classList.remove('incorrect'));

    const errors = getSignupFormErrors(
        firstnameInput.value,
        lastnameInput.value,
        ageInput.value,
        addressInput.value,
        phoneInput.value,
        zipcodeInput.value,
        avatarInput.value,
        genderInput.value.toUpperCase(),
        emailInput.value,
        passwordInput.value,
        repeatPasswordInput.value
    );

    if (errors.length > 0) {
        errorMessage.innerText = errors.join('. ');
        return;
    }

    await handleSignUp();
});

function getSignupFormErrors(firstname, lastname, age, address, phone, zipcode, avatar, gender, email, password, repeatPassword) {
    const errors = [];
    const nameRegex = /^[A-Za-z]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?\d{5,15}$/;
    const zipRegex = /^\d{4,10}$/;
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

    if (!firstname) {
        errors.push('First name is required');
        firstnameInput.parentElement.classList.add('incorrect');
    } else if (!nameRegex.test(firstname)) {
        errors.push('First name should contain only letters');
        firstnameInput.parentElement.classList.add('incorrect');
    }

    if (!lastname) {
        errors.push('Last name is required');
        lastnameInput.parentElement.classList.add('incorrect');
    } else if (!nameRegex.test(lastname)) {
        errors.push('Last name should contain only letters');
        lastnameInput.parentElement.classList.add('incorrect');
    }

    if (!age) {
        errors.push('Age is required');
        ageInput.parentElement.classList.add('incorrect');
    } else if (isNaN(age) || age < 13 || age > 120) {
        errors.push('Age must be between 13 and 120');
        ageInput.parentElement.classList.add('incorrect');
    }

    if (!address) {
        errors.push('Address is required');
        addressInput.parentElement.classList.add('incorrect');
    }

    if (!phone) {
        errors.push('Phone number is required');
        phoneInput.parentElement.classList.add('incorrect');
    } else if (!phoneRegex.test(phone)) {
        errors.push('Phone number must be 5-15 digits and may start with +');
        phoneInput.parentElement.classList.add('incorrect');
    }

    if (!zipcode) {
        errors.push('Zipcode is required');
        zipcodeInput.parentElement.classList.add('incorrect');
    } else if (!zipRegex.test(zipcode)) {
        errors.push('Zipcode must be 4-10 digits');
        zipcodeInput.parentElement.classList.add('incorrect');
    }

    if (!avatar) {
        errors.push('Avatar URL is required');
        avatarInput.parentElement.classList.add('incorrect');
    } else if (!urlRegex.test(avatar)) {
        errors.push('Avatar must be a valid URL');
        avatarInput.parentElement.classList.add('incorrect');
    }

    if (!gender) {
        errors.push('Gender is required');
        genderInput.parentElement.classList.add('incorrect');
    } else if (!['MALE', 'FEMALE', 'OTHER'].includes(gender.toUpperCase())) {
        errors.push('Gender must be MALE, FEMALE, or OTHER');
        genderInput.parentElement.classList.add('incorrect');
    }    

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
    } else if (password.length < 8) {
        errors.push('Password must be at least 8 characters');
        passwordInput.parentElement.classList.add('incorrect');
    }

    if (password !== repeatPassword) {
        errors.push('Passwords do not match');
        passwordInput.parentElement.classList.add('incorrect');
        repeatPasswordInput.parentElement.classList.add('incorrect');
    }

    return errors;
}

async function handleSignUp() {
    const userData = {
        firstName: firstnameInput.value.trim(),
        lastName: lastnameInput.value.trim(),
        age: parseInt(ageInput.value, 10),
        email: emailInput.value.trim(),
        password: passwordInput.value,
        address: addressInput.value.trim(),
        phone: phoneInput.value.trim(),
        zipcode: zipcodeInput.value.trim(),
        avatar: avatarInput.value.trim(),
        gender: genderInput.value.trim().toUpperCase(),
    };

    try {
        const response = await fetch('https://api.everrest.educata.dev/auth/sign_up', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed. Please try again.');
        }

        window.location.href = 'login.html';
    } catch (error) {
        errorMessage.innerText = error.message;
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