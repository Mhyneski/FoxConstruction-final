const mongoose = require('mongoose');
    const Template = require('../models/templatesModel');
    const Material = require('../models/materialsModel');

    const validUnits = [
        'lot',
        'cu.m',
        'bags',
        'pcs',
        'shts',
        'kgs',
        'gal',
        'liters',
        'set',
        'm',
        'L-m',
        'sheets',
        'pieces',
        'meters',
        // Add other units as needed
    ];
    
    module.exports = validUnits;

    const allCategories = [
        'Earthwork',
        'Concrete',
        'Rebars',
        'Formworks',
        'Scaffoldings',
        'Masonry',
        'Architectural - Tiles',
        'Architectural - Painting',
        'Roofing',
        'Doors and Windows',
        'Electrical',
        'Plumbing',
        'Septic Tank and Catch Basins',
        // Add other categories as needed
      ];
      

      const createCustomTemplate = async (req, res) => {
        try {
          let { title, type, tier, totalArea, numFloors, avgFloorHeight, roomCount, foundationDepth } = req.body;
          const userId = req.user._id;
      
          // Concatenate the title and tier
          title = `${title} - ${tier.charAt(0).toUpperCase() + tier.slice(1)}`;
      
          // Initialize categories with allCategories
          const categories = allCategories.map(categoryName => ({
            category: categoryName,
            materials: [],
          }));
      
          const bom = {
            totalArea,
            numFloors,
            avgFloorHeight,
            roomCount,
            foundationDepth,
            categories,
            laborCost: 0,
            totalProjectCost: 0,
          };
      
          const newTemplate = new Template({
            title,
            type,
            tier,
            bom,
            createdBy: userId,
          });
      
          await newTemplate.save();
      
          res.status(201).json({ success: true, template: newTemplate });
        } catch (error) {
          console.error('Error creating custom template:', error);
          res.status(500).json({ error: 'Failed to create custom template.' });
        }
      };
    
      
    // Remove a material from a category
    const removeMaterialFromCategory = async (req, res) => {
      try {
        const { templateId, categoryName, materialId } = req.params;
        const userId = req.user._id;
    
        const template = await Template.findOne({ _id: templateId, createdBy: userId });
    
        if (!template) {
          return res.status(404).json({ error: 'Template not found.' });
        }
    
        const category = template.bom.categories.find(cat => cat.category.toLowerCase() === categoryName.toLowerCase());
        if (!category) {
          return res.status(404).json({ error: 'Category not found.' });
        }
    
        const materialIndex = category.materials.findIndex(material => material._id.toString() === materialId);
        if (materialIndex === -1) {
          return res.status(404).json({ error: 'Material not found in the category.' });
        }
    
        // Remove the material
        category.materials.splice(materialIndex, 1);
    
        // Save the updated template
        await template.save();
    
        res.status(200).json({ success: true, template });
      } catch (error) {
        console.error('Error removing material:', error);
        res.status(500).json({ error: 'Failed to remove material.' });
      }
    };
    
  

    const addMaterialToCategory = async (req, res) => {
        try {
        const { templateId, categoryName } = req.params;
        const userId = req.user._id;
        const { materialId, description, quantity, unit, cost, scaling } = req.body;
    
        // Find the template owned by the user
        const template = await Template.findOne({ _id: templateId, createdBy: userId });
    
        if (!template) {
            return res.status(404).json({ error: 'Template not found.' });
        }
    
        // Find the category
        const category = template.bom.categories.find(
            (cat) => cat.category.toLowerCase() === categoryName.toLowerCase()
        );
    
        if (!category) {
            return res.status(404).json({ error: 'Category not found.' });
        }
    
        let materialData;
    
        if (materialId) {
            // **User selected an existing material**
    
            // Retrieve material from database
            const existingMaterial = await Material.findById(materialId);
            if (!existingMaterial) {
            return res.status(404).json({ error: 'Material not found in the database.' });
            }
    
            // Use the existing material's data
            materialData = {
            description: existingMaterial.description,
            unit: existingMaterial.unit,
            cost: existingMaterial.cost,
            };
    
            // **Optionally allow overriding the cost**
            if (cost !== undefined) {
            if (isNaN(cost) || cost < 0) {
                return res.status(400).json({ error: 'Cost must be a non-negative number.' });
            }
            materialData.cost = parseFloat(cost);
            }
        } else {
            // **User is inputting a new material**
    
            // **Validate 'description' field**
            if (!description || typeof description !== 'string') {
            return res.status(400).json({ error: 'Description is required and must be a string.' });
            }
    
            // **Validate 'unit' field**
            if (!unit || !validUnits.includes(unit)) {
            return res.status(400).json({ error: `Invalid unit. Valid units are: ${validUnits.join(', ')}` });
            }
    
            // **Validate 'cost' field**
            if (isNaN(cost) || cost < 0) {
            return res.status(400).json({ error: 'Cost must be a non-negative number.' });
            }
    
            materialData = {
            description,
            unit,
            cost: parseFloat(cost),
            };
        }
    
        // **Validate 'quantity' field**
        const parsedQuantity = parseFloat(quantity);
        if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
            return res.status(400).json({ error: 'Quantity must be a positive number.' });
        }
    
        // **Set default scaling factors if not provided**
        const scalingFactors = ['areaFactor', 'heightFactor', 'roomCountFactor', 'foundationDepthFactor'];
        const scalingInput = scaling || {};
    
        const materialScaling = {};
        scalingFactors.forEach((factor) => {
            materialScaling[factor] =
            scalingInput[factor] !== undefined ? Number(scalingInput[factor]) : 1;
        });

        const categoryIndex = template.bom.categories.findIndex(
            (cat) => cat.category.toLowerCase() === categoryName.toLowerCase()
        ) + 1; 
    
        const materialIndex = category.materials.length + 1; 
    
        const item = `${categoryIndex}.${materialIndex}`;
    
       
        const totalAmount = parseFloat((parsedQuantity * materialData.cost).toFixed(2));
    
        
        const material = {
            item,
            description: materialData.description,
            quantity: parsedQuantity,
            unit: materialData.unit,
            cost: materialData.cost,
            totalAmount,
            scaling: materialScaling,
        };
    
        // **Add material to category**
        category.materials.push(material);
    
        // **Save the template**
        await template.save();
    
        res.status(200).json({ success: true, template });
        } catch (error) {
        console.error('Error adding material:', error);
        res.status(500).json({ error: 'Failed to add material.' });
        }
    };

    const getTemplates = async (req, res) => {
        try {
          const userId = req.user._id;
      
         
          const templates = await Template.find({
            $or: [
              { createdBy: userId },
              { createdBy: { $exists: false } }
            ]
          }).sort({ createdAt: -1 });
      
          res.status(200).json({ success: true, templates });
        } catch (error) {
          console.error('Error fetching templates:', error);
          res.status(500).json({ error: 'Failed to fetch templates.' });
        }
      };
    
    // Get specific template by ID
    const getTemplateById = async (req, res) => {
        try {
        const { id } = req.params;
        const userId = req.user._id;
    
        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid template ID.' });
        }
    
        const template = await Template.findOne({ _id: id, createdBy: userId });
        if (!template) {
            return res.status(404).json({ error: 'Template not found.' });
        }
    
        res.status(200).json({ success: true, template });
        } catch (error) {
        console.error('Error fetching template:', error);
        res.status(500).json({ error: 'Failed to fetch template.' });
        }
    };
    
    // Delete a template
    const deleteTemplate = async (req, res) => {
        try {
        const { id } = req.params;
        const userId = req.user._id;
    
        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid template ID.' });
        }
    
        const template = await Template.findOneAndDelete({ _id: id, createdBy: userId });
        if (!template) {
            return res.status(404).json({ error: 'Template not found or already deleted.' });
        }
    
        res.status(200).json({ success: true, message: 'Template deleted successfully.' });
        } catch (error) {
        console.error('Error deleting template:', error);
        res.status(500).json({ error: 'Failed to delete template.' });
        }
    };
    
    // Update a template
    const updateTemplate = async (req, res) => {
        try {
          const { id } = req.params;
          const userId = req.user._id;
          let updateData = req.body;
      
       
          if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid template ID.' });
          }
      
          const template = await Template.findOneAndUpdate(
            { _id: id, createdBy: userId },
            updateData,
            { new: true }
          );
      
          if (!template) {
            return res.status(404).json({ error: 'Template not found or not authorized to update.' });
          }
      
          res.status(200).json({ success: true, template });
        } catch (error) {
          console.error('Error updating template:', error);
          res.status(500).json({ error: 'Failed to update template.' });
        }
      };
      
      
      
    
    module.exports = {
        createCustomTemplate,
        addMaterialToCategory,
        getTemplates,
        getTemplateById,
        deleteTemplate,
        updateTemplate,
        removeMaterialFromCategory
    };