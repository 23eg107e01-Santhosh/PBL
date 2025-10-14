const { Department, Section, Intake } = require('../models');
const { validationResult } = require('express-validator');

// DEPARTMENT CONTROLLERS
const createDepartment = async (req, res) => {
  try {
    const { name, shortName, departmentChairmanName, chairmanRoom } = req.body;

    // Check if short name already exists
    const existingDepartment = await Department.findOne({ shortName });
    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        message: 'Department with this short name already exists'
      });
    }

    const department = new Department({
      name,
      shortName,
      departmentChairmanName,
      chairmanRoom
    });

    await department.save();

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department
    });

  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating department'
    });
  }
};

const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });

    res.json({
      success: true,
      data: departments
    });

  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching departments'
    });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if shortName is being updated and if it already exists
    if (updates.shortName) {
      const existingDepartment = await Department.findOne({ 
        shortName: updates.shortName,
        _id: { $ne: id }
      });
      if (existingDepartment) {
        return res.status(400).json({
          success: false,
          message: 'Short name already in use'
        });
      }
    }

    const department = await Department.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.json({
      success: true,
      message: 'Department updated successfully',
      data: department
    });

  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating department'
    });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findByIdAndDelete(id);
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.json({
      success: true,
      message: 'Department deleted successfully'
    });

  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting department'
    });
  }
};

// SECTION CONTROLLERS
const createSection = async (req, res) => {
  try {
    const { section, description } = req.body;

    const newSection = new Section({
      section,
      description
    });

    await newSection.save();

    res.status(201).json({
      success: true,
      message: 'Section created successfully',
      data: newSection
    });

  } catch (error) {
    console.error('Create section error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating section'
    });
  }
};

const getSections = async (req, res) => {
  try {
    const sections = await Section.find().sort({ section: 1 });

    res.json({
      success: true,
      data: sections
    });

  } catch (error) {
    console.error('Get sections error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching sections'
    });
  }
};

const updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const section = await Section.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }

    res.json({
      success: true,
      message: 'Section updated successfully',
      data: section
    });

  } catch (error) {
    console.error('Update section error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating section'
    });
  }
};

const deleteSection = async (req, res) => {
  try {
    const { id } = req.params;

    const section = await Section.findByIdAndDelete(id);
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }

    res.json({
      success: true,
      message: 'Section deleted successfully'
    });

  } catch (error) {
    console.error('Delete section error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting section'
    });
  }
};

// INTAKE CONTROLLERS
const createIntake = async (req, res) => {
  try {
    const { intake } = req.body;

    // Check if intake already exists
    const existingIntake = await Intake.findOne({ intake });
    if (existingIntake) {
      return res.status(400).json({
        success: false,
        message: 'Intake already exists'
      });
    }

    const newIntake = new Intake({
      intake
    });

    await newIntake.save();

    res.status(201).json({
      success: true,
      message: 'Intake created successfully',
      data: newIntake
    });

  } catch (error) {
    console.error('Create intake error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating intake'
    });
  }
};

const getIntakes = async (req, res) => {
  try {
    const intakes = await Intake.find().sort({ intake: -1 }); // Latest first

    res.json({
      success: true,
      data: intakes
    });

  } catch (error) {
    console.error('Get intakes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching intakes'
    });
  }
};

const updateIntake = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if intake number is being updated and if it already exists
    if (updates.intake) {
      const existingIntake = await Intake.findOne({ 
        intake: updates.intake,
        _id: { $ne: id }
      });
      if (existingIntake) {
        return res.status(400).json({
          success: false,
          message: 'Intake number already exists'
        });
      }
    }

    const intake = await Intake.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!intake) {
      return res.status(404).json({
        success: false,
        message: 'Intake not found'
      });
    }

    res.json({
      success: true,
      message: 'Intake updated successfully',
      data: intake
    });

  } catch (error) {
    console.error('Update intake error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating intake'
    });
  }
};

const deleteIntake = async (req, res) => {
  try {
    const { id } = req.params;

    const intake = await Intake.findByIdAndDelete(id);
    
    if (!intake) {
      return res.status(404).json({
        success: false,
        message: 'Intake not found'
      });
    }

    res.json({
      success: true,
      message: 'Intake deleted successfully'
    });

  } catch (error) {
    console.error('Delete intake error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting intake'
    });
  }
};

module.exports = {
  // Department
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
  // Section
  createSection,
  getSections,
  updateSection,
  deleteSection,
  // Intake
  createIntake,
  getIntakes,
  updateIntake,
  deleteIntake
};