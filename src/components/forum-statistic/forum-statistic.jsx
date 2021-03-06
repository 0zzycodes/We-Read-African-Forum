import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import firebase, { firestore } from '../../firebase/firebase.utils';
import { updateOnlineUsers } from '../../redux/user/user.actions'
import { setMembers } from '../../redux/user/user.actions';
import { selectOnlineUsers, selectMembers } from '../../redux/user/user.selectors'
import { selectLatestPosts, selectSubForumTopicRoutes, selectPostCount } from '../../redux/forum/forum.selector';
import post from '../../assets/statistic/post.svg'
import newMember from '../../assets/statistic/new-member.svg'
import recentPost from '../../assets/statistic/recent-post.svg'
import './forum-statistic.scss'
import ForumStatisticBox from '../forum-statistic-box/forum-statistic-box'
const ForumStatistics = ({ updateOnlineUsers, setMembers, onlineUsers, topics, posts, members, postCount }) => {
    useEffect(() => {
        const usersRef = firebase.database().ref('/presence');
        const membersRef = firestore.collection("users").orderBy("createdAt", "desc");
        usersRef.on('value', function (snapshot) {
            snapshot.val() && updateOnlineUsers(Object.keys(snapshot.val()))
        })
        membersRef.onSnapshot(async (snapshot) => {
            const membersArr = [];
            snapshot.docs.forEach((doc) => {
                membersArr.push(doc.data());
            });
            setMembers(membersArr);
        });
    }, [])
    const countTopics = () => {
        const tops = []
        topics.forEach(item => item.forEach((item2) => tops.push(item2)))
        return tops.length
    }
    return (
        <div className="forum-statistics">
            <div className="bar"> <span>Forum Statistics</span></div>
            <div className="statistics">
                <ForumStatisticBox data={{ count: topics.length, textVal: 'forums' }} />
                <ForumStatisticBox data={{ count: countTopics(), textVal: 'topics' }} />
                <ForumStatisticBox data={{
                    count: postCount.reduce((a, b) => {
                        return a + b;
                    }, 0), textVal: 'posts'
                }} />
                <ForumStatisticBox data={{ count: onlineUsers ? onlineUsers.length : 0, textVal: 'online' }} />
                <ForumStatisticBox data={{ count: members.length, textVal: 'members' }} />
            </div>
            <div className="statistic-footer">
                <div className="latest-post">
                    <img className="stat-icon" src={post} alt="post" />
                    <span>Latest Post: <span>{posts.length !== 0 ? posts[0].latest_post.title : 'My top book for the year 2019'}</span> </span>
                </div>
                <div className="newest-member">
                    <img className="stat-icon" src={newMember} alt="user icon" />
                    <span>Newest Member: <span className='newest-member-name'>{members.length !== 0 ? members[0].displayName : 'Jane Doe'}</span></span>
                </div>
                <div className="recnt-post">
                    <img className="stat-icon" src={recentPost} alt="recent" />
                    <Link to="/recent-posts">
                        <span>Recent Posts</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}
const mapStateToProps = createStructuredSelector({
    onlineUsers: selectOnlineUsers,
    posts: selectLatestPosts,
    topics: selectSubForumTopicRoutes,
    members: selectMembers,
    postCount: selectPostCount
});
const mapDispatchToProps = (dispatch) => ({
    updateOnlineUsers: (user) => dispatch(updateOnlineUsers(user)),
    setMembers: (members) => dispatch(setMembers(members))
});

export default connect(mapStateToProps, mapDispatchToProps)(ForumStatistics);
