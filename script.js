
function shareScore() {
    const shareData = {
        title: 'Tennis Scoreboard',
        text: 'Check out the latest tennis match scores!',
        url: window.location.href
    };

    if (navigator.share) {
        navigator.share(shareData).then(() => {
            console.log('Score shared successfully');
        }).catch((error) => {
            console.error('Error sharing score:', error);
        });
    } else {
        alert('Sharing is not supported in this browser.');
    }
}