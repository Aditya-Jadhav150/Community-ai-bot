export interface DemoDepartment {
  id: string;
  name: string;
  openIssues: number;
  assignedWorkers: number;
  color: string;
  isEmergency?: boolean;
}

export const demoDepartments: DemoDepartment[] = [
  { id: "dept_001", name: "Roads & Infrastructure", openIssues: 8, assignedWorkers: 3, color: "#FF9500" },
  { id: "dept_002", name: "Sanitation & Waste Management", openIssues: 6, assignedWorkers: 2, color: "#30D158" },
  { id: "dept_003", name: "Water & Drainage", openIssues: 4, assignedWorkers: 2, color: "#00AEFF" },
  { id: "dept_004", name: "Electrical & Street Lighting", openIssues: 3, assignedWorkers: 1, color: "#FFD60A" },
  { id: "dept_005", name: "Parks & Public Spaces", openIssues: 2, assignedWorkers: 1, color: "#9B5DE5" },
  { id: "dept_006", name: "Traffic Management", openIssues: 3, assignedWorkers: 1, color: "#FF3B30" },
  { id: "dept_007", name: "Emergency Services", openIssues: 1, assignedWorkers: 2, color: "#FF3B30", isEmergency: true },
];
