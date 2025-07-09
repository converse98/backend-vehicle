const Post = require('../models/Post');

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find({ dealerId: req.params.id });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getPost = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, dealerId: req.params.dealerId });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const post = new Post({ ...req.body, dealerId: req.params.dealerId });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, dealerId: req.params.dealerId },
      req.body,
      { new: true }
    );
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, dealerId: req.params.dealerId });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.searchPosts = async (req, res) => {
  try {
    const text = req.query.text;
    const dealerId = req.params.dealerId;

    const posts = await Post.find({
      dealerId,
      $or: [
        { title: { $regex: text, $options: 'i' } },
        { vehicleName: { $regex: text, $options: 'i' } },
        { accessoryName: { $regex: text, $options: 'i' } },
      ],
    });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
