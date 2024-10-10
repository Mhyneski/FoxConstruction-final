const Template = require('../models/templatesModel');

const generateBOM = async (req, res) => {
  let { totalArea, numFloors, avgFloorHeight, templateTier } = req.body;

  try {
    // Convert inputs to the correct data types
    totalArea = parseFloat(totalArea);
    numFloors = parseInt(numFloors, 10);
    avgFloorHeight = parseFloat(avgFloorHeight);

    // Validate templateTier to match the expected values
    const validTiers = ['economy', 'standard', 'premium'];
    if (!validTiers.includes(templateTier)) {
      return res.status(400).json({ error: "Invalid template tier. Must be one of: economy, standard, premium." });
    }

    // Find the base template for the given tier
    const baseTemplate = await Template.findOne({ tier: templateTier });

    if (!baseTemplate) {
      return res.status(404).json({ error: "Base template not found." });
    }

    // Check if the base template has a valid BOM
    if (!baseTemplate.bom || !baseTemplate.bom.materials || baseTemplate.bom.materials.length === 0) {
      return res.status(400).json({ error: "BOM or materials not found or is empty in the template." });
    }

    // Calculate scaling factors
    const areaFactor = totalArea / baseTemplate.bom.totalArea;
    const floorFactor = numFloors / baseTemplate.bom.numFloors;
    const heightFactor = avgFloorHeight / baseTemplate.bom.avgFloorHeight;
    const scaleFactor = areaFactor * floorFactor * heightFactor;

    // Validate the scaling factor
    if (isNaN(scaleFactor) || scaleFactor <= 0) {
      return res.status(400).json({ error: "Invalid scaling factor calculation." });
    }

    // Scale the materials
    const scaledMaterials = baseTemplate.bom.materials.map(material => {
      let scaledQuantity;
      switch (material.category.toLowerCase().trim()) {
        case 'earthwork':
          scaledQuantity = material.quantity * areaFactor * heightFactor;
          break;
        case 'concrete':
          scaledQuantity = material.quantity * areaFactor * floorFactor * heightFactor;
          break;
        case 'rebars':
          scaledQuantity = material.quantity * areaFactor * floorFactor * heightFactor;
          break;
        case 'formworks':
          scaledQuantity = material.quantity * areaFactor * floorFactor;
          break;
        case 'roofing':
          scaledQuantity = material.quantity * areaFactor;
          break;
        case 'painting':
          scaledQuantity = material.quantity * areaFactor * floorFactor;
          break;
        case 'electrical':
        case 'plumbing':
          scaledQuantity = material.quantity * areaFactor * floorFactor;
          break;
        default:
          scaledQuantity = material.quantity * scaleFactor;
      }
      const scaledTotalAmount = material.unitCost * scaledQuantity;
      return {
        ...material,
        quantity: scaledQuantity,
        totalAmount: scaledTotalAmount
      };
    });

    // Group the materials by category
    const groupedMaterials = scaledMaterials.reduce((acc, material) => {
      const category = material.category && material.category.trim() !== '' ? material.category.trim().toUpperCase() : 'UNCATEGORIZED';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(material);
      return acc;
    }, {});

    // Scale the labor cost
    const scaledLaborCost = baseTemplate.bom.laborCost * (areaFactor + floorFactor + heightFactor) / 3;
    const scaledTotalProjectCost = scaledMaterials.reduce((sum, material) => sum + material.totalAmount, 0) + scaledLaborCost;

    // Prepare the BOM response
    const bom = {
      projectDetails: {
        totalArea,
        numFloors,
        avgFloorHeight,
      },
      materials: groupedMaterials,
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
