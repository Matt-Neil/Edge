const Workspaces = require('../models/Workspaces');
const Users = require('../models/Users');

exports.getWorkspaces = async (req, res, next) => {
    try {
        const workspaces = await Workspaces.find({creator: res.locals.currentUser._id});
    
        res.status(201).json({
            success: true,
            data: workspaces
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.getWorkspace = async (req, res, next) => {
    try {
        const workspace = await Workspaces.findOne({ $and: [{ _id: req.params.id }, { creator: res.locals.currentUser._id }] });

        res.status(201).json({
            success: true,
            data: workspace
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.postWorkspace = async (req, res, next) => {
    try {
        const workspace = await Workspaces.create(req.body);

        try {
            const user = await Users.findById(res.locals.currentUser._id);
    
            if (!user) {
                res.status(404).json({
                    success: false,
                    error: 'No User Found.'
                })
            } else {
                const updatedWorkspaces = user.workspaces.concat(workspace._id)

                user.workspaces = updatedWorkspaces

                await user.save()

                res.status(201).json({
                    success: true,
                    data: workspace._id
                })
            }
        } catch (err) {
            res.status(500).json({
                success: false,
                error: 'Server Error'
            })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.putWorkspace = async (req, res, next) => {
    try {
        const workspace = await Workspaces.findById(req.params.id);

        if (!workspace) {
            res.status(404).json({
                success: false,
                error: "No Workspace Found."
            })
        } else {
            workspace.data = req.body.data

            await workspace.save();

            res.status(201).json({
                success: true
            })
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}