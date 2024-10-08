const Template = require('../models/templatesModel');

const generateBOM = async (req, res) => {
  let { totalArea, numFloors, avgFloorHeight, templateTier } = req.body;

  try {
    totalArea = parseFloat(totalArea);
    numFloors = parseInt(numFloors, 10);
    avgFloorHeight = parseFloat(avgFloorHeight);

    const baseTemplate = await Template.findOne({ tier: templateTier });

    if (!baseTemplate) {
      return res.status(404).json({ error: "Base template not found." });
    }

    if (!baseTemplate.bom || !baseTemplate.bom.materials || baseTemplate.bom.materials.length === 0) {
      return res.status(400).json({ error: "BOM or materials not found or is empty in the template." });
    }

    const areaFactor = totalArea / baseTemplate.bom.totalArea;
    const floorFactor = numFloors / baseTemplate.bom.numFloors;
    const heightFactor = avgFloorHeight / baseTemplate.bom.avgFloorHeight;
    const scaleFactor = areaFactor * floorFactor * heightFactor;

    if (isNaN(scaleFactor) || scaleFactor <= 0) {
      return res.status(400).json({ error: "Invalid scaling factor calculation." });
    }

    // Scale the materials
    const scaledMaterials = baseTemplate.bom.materials.map(material => {
      const scaledQuantity = material.quantity * scaleFactor;
      const scaledTotalAmount = material.unitCost * scaledQuantity;
      return {
        ...material,
        quantity: scaledQuantity,
        totalAmount: scaledTotalAmount
      };
    });

    // Group materials by category
    const groupedMaterials = scaledMaterials.reduce((acc, material) => {
      const category = material.category && material.category.trim() !== '' ? material.category : 'UNCATEGORIZED';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(material);
      return acc;
    }, {});

    const scaledLaborCost = baseTemplate.bom.laborCost * scaleFactor;
    const scaledTotalProjectCost = baseTemplate.bom.totalProjectCost * scaleFactor;

    const bom = {
      projectDetails: {
        totalArea,
        numFloors,
        avgFloorHeight,
      },
      materials: groupedMaterials, // Send grouped materials
      laborCost: scaledLaborCost,
      totalProjectCost: scaledTotalProjectCost,
    };

    res.status(200).json({ success: true, bom });

  } catch (error) {
    console.error("Error generating BOM:", error.message);
    res.status(500).json({ error: "Failed to generate BOM.", details: error.message });
  }
};

module.exports = { generateBOM };
