export type EmployeeData = {
  employeeName: string;
  employeeId: string;
  phone: string;
  address: string;
  city: string;
  dateOfBirth: string;
  state: string;
  zipCode: string;
  ssn: string;
  jobTitle: string;
  checkbox1: boolean;
  checkbox2: boolean;
  checkbox3: boolean;
};

export const MOCK_EMPLOYEES: EmployeeData[] = [
  {
    employeeName: "Hamsa",
    employeeId: "1000045",
    phone: "123-456-7890",
    address: "12 happy street",
    city: "anytown-C",
    dateOfBirth: "01/15/2025",
    state: "CA",
    zipCode: "12345",
    ssn: "123-45-6789",
    jobTitle: "Software Engineer",
    checkbox1: true,
    checkbox2: false,
    checkbox3: true,
  },
  {
    employeeName: "Alex Rivera",
    employeeId: "1000046",
    phone: "555-123-4567",
    address: "456 Oak Ave",
    city: "Springfield",
    dateOfBirth: "03/22/1990",
    state: "IL",
    zipCode: "62701",
    ssn: "987-65-4321",
    jobTitle: "Product Manager",
    checkbox1: false,
    checkbox2: true,
    checkbox3: false,
  },
  {
    employeeName: "Jordan Lee",
    employeeId: "1000047",
    phone: "(212) 555-0199",
    address: "789 Broadway",
    city: "New York",
    dateOfBirth: "11/08/1985",
    state: "NY",
    zipCode: "10003",
    ssn: "111-22-3333",
    jobTitle: "Designer",
    checkbox1: true,
    checkbox2: true,
    checkbox3: false,
  },
  {
    employeeName: "Sam Chen",
    employeeId: "1000048",
    phone: "415-555-0200",
    address: "321 Market St",
    city: "San Francisco",
    dateOfBirth: "07/14/1992",
    state: "CA",
    zipCode: "94102",
    ssn: "444-55-6666",
    jobTitle: "Data Engineer",
    checkbox1: false,
    checkbox2: false,
    checkbox3: true,
  },
  {
    employeeName: "Taylor Brown",
    employeeId: "1000049",
    phone: "512-555-0300",
    address: "100 Congress Ave",
    city: "Austin",
    dateOfBirth: "09/30/1988",
    state: "TX",
    zipCode: "78701",
    ssn: "777-88-9999",
    jobTitle: "DevOps Lead",
    checkbox1: true,
    checkbox2: false,
    checkbox3: true,
  },
];
