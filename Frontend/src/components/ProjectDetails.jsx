import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "../css/ProjectDetails.module.css";
import { useAuthContext } from '../hooks/useAuthContext';
import Navbar from './Navbar';

const ProjectDetails = () => {
  const { id } = useParams(); // Get project ID from the URL
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`https://foxconstruction-final.onrender.com/api/preprojects/${id}`, {
            headers: {
                Authorization: `Bearer ${user?.token}`,
              },
        });
        setProject(response.data);
      } catch (error) {
        console.error("Error fetching project details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return <p>Loading project details...</p>;
  }

  if (!project) {
    return <p>Project not found.</p>;
  }

  return (
    <>
    <Navbar />
    <div className={styles.detailsContainer}>
      <h1>{project.title}</h1>
      <img
        src={
          project.image && project.image.length > 0
            ? project.image[0].path
            : "/placeholder.jpg"
        }
        alt={project.title}
        className={styles.projectImage}
      />
      <div className={styles.bomDetails}>
        <h2>Bill of Materials</h2>
        <p><strong>Total Area:</strong> {project.bom.totalArea} sqm</p>
        <p><strong>Number of Floors:</strong> {project.bom.numFloors}</p>
        <p><strong>Room Count:</strong> {project.bom.roomCount}</p>
        <p><strong>Foundation Depth:</strong> {project.bom.foundationDepth} m</p>
        <p><strong>Labor Cost:</strong> ₱{project.bom.laborCost.toLocaleString()}</p>
        <p><strong>Material Cost:</strong> ₱{project.bom.materialTotalCost.toLocaleString()}</p>
        <p><strong>Tax:</strong> ₱{project.bom.tax.toLocaleString()}</p>
        <p><strong>Total Project Cost:</strong> ₱{project.bom.totalProjectCost.toLocaleString()}</p>
        <div>
          <h3>Categories:</h3>
          {project.bom.categories.map((category, index) => (
            <div key={index} className={styles.category}>
              <h4>{category.category}</h4>
              <ul>
                {category.materials.map((material, idx) => (
                  <li key={idx}>
                    <strong>{material.description}</strong>: {material.quantity} {material.unit} @ ₱{material.cost.toLocaleString()} = ₱{material.totalAmount.toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
};

export default ProjectDetails;
