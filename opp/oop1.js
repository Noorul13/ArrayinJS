// Define a class called `Doctor`
class Doctor {
    constructor(name, specialty) {
        console.log(`constructor called`);
        this.name = name;
        this.specialty = specialty;
    }

    // Method to display doctor's information
    getDoctorInfo() {
        return `Dr. ${this.name}, Specialist in ${this.specialty}`;
    }
}

// Create an instance (object) of Doctor
const doctor1 = new Doctor("Rajeev Kumar", "Cardiology");

// Call the method
//console.log(doctor1.getDoctorInfo());  // Output: Dr. Rajeev Kumar, Specialist in Cardiology
