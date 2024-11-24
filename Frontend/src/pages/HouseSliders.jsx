import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../css/HouseSliders.module.css";
import { useAuthContext } from "../hooks/useAuthContext";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const HouseSliders = () => {
  const [preprojects, setPreprojects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const { user } = useAuthContext();

  // Fetch all preprojects from the backend
  useEffect(() => {
    const fetchPreprojects = async () => {
      try {
        const response = await axios.get("https://foxconstruction-final.onrender.com/api/preprojects", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        setPreprojects(response.data);
        setFilteredProjects(response.data); // Initialize the filtered list
      } catch (error) {
        console.error("Error fetching preprojects:", error);
      }
    };
    fetchPreprojects();
  }, [user]);

  // Handle the filter logic
  const handleFilter = () => {
    const min = parseInt(minBudget, 10) || 0;
    const max = parseInt(maxBudget, 10) || Infinity;

    const filtered = preprojects.filter(
      (project) =>
        project.bom.totalProjectCost >= min &&
        project.bom.totalProjectCost <= max
    );
    setFilteredProjects(filtered);
  };

  return (
    <>
    <Navbar/>
    <div className={styles.container}>
      {/* Filter Section */}
      <div className={styles.filterContainer}>
        <h2>Filter by Budget</h2>
        <input
          type="number"
          placeholder="Minimum Budget"
          value={minBudget}
          onChange={(e) => setMinBudget(e.target.value)}
        />
        <input
          type="number"
          placeholder="Maximum Budget"
          value={maxBudget}
          onChange={(e) => setMaxBudget(e.target.value)}
        />
        <button onClick={handleFilter}>Filter</button>
      </div>

      {/* Project List */}
      <div className={styles.projectList}>
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <Link
              to={`/projects/${project._id}`} // Navigate to the project details page
              key={project._id}
              className={styles.projectCard}
            >
              <img
                src={
                  project.image && project.image.length > 0
                    ? project.image[0].path
                    : "/placeholder.jpg"
                }
                alt={project.title || "Project Image"}
                className={styles.projectImage}
              />
              <div className={styles.projectDetails}>
                <h3>{project.title}</h3>
                <p>
                  <strong>Total Area:</strong> {project.bom.totalArea} sqm
                </p>
                <p>
                  <strong>Number of Floors:</strong> {project.bom.numFloors}
                </p>
                <p>
                  <strong>Room Count:</strong> {project.bom.roomCount}
                </p>
                <p>
                  <strong>Total Project Cost:</strong> ₱
                  {project.bom.totalProjectCost.toLocaleString()}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <p>No projects found within the specified budget range.</p>
        )}
      </div>
    </div>
    </>
  );
};

export default HouseSliders;
