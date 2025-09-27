import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-turbo-toast'

// Example 1: Simple custom view with image
const ProfileToast = ({ name, avatar }: { name: string; avatar: string }) => (
  <View style={styles.profileToast}>
    <Image source={{ uri: avatar }} style={styles.avatar} />
    <View style={styles.profileContent}>
      <Text style={styles.profileName}>{name}</Text>
      <Text style={styles.profileMessage}>is now online</Text>
    </View>
  </View>
)

// Example 2: Interactive custom view with buttons
const DownloadToast = ({
  filename,
  onOpen,
  onDismiss,
}: {
  filename: string
  onOpen: () => void
  onDismiss: () => void
}) => (
  <View style={styles.downloadToast}>
    <View style={styles.downloadContent}>
      <Text style={styles.downloadIcon}>📥</Text>
      <View style={styles.downloadText}>
        <Text style={styles.downloadTitle}>Download Complete</Text>
        <Text style={styles.downloadFilename}>{filename}</Text>
      </View>
    </View>
    <View style={styles.downloadActions}>
      <TouchableOpacity onPress={onOpen} style={styles.downloadButton}>
        <Text style={styles.downloadButtonText}>Open</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
        <Text style={styles.dismissButtonText}>Dismiss</Text>
      </TouchableOpacity>
    </View>
  </View>
)

// Example 3: Progress custom view
const UploadProgressToast = ({ progress, filename }: { progress: number; filename: string }) => (
  <View style={styles.uploadToast}>
    <View style={styles.uploadHeader}>
      <Text style={styles.uploadIcon}>☁️</Text>
      <Text style={styles.uploadTitle}>Uploading {filename}</Text>
    </View>
    <View style={styles.progressBar}>
      <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
    </View>
    <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
  </View>
)

export const CustomToastExamples = {
  // Show profile notification
  showProfileToast: () => {
    Toast.show({
      message: '', // Required but not used with custom view
      customView: <ProfileToast name="John Doe" avatar="https://i.pravatar.cc/150?img=12" />,
      position: 'top',
      duration: 3000,
      backgroundColor: '#ffffff',
    })
  },

  // Show download complete with actions
  showDownloadToast: (filename: string) => {
    Toast.show({
      message: '',
      customView: ({ onDismiss }) => (
        <DownloadToast
          filename={filename}
          onOpen={() => {
            console.log('Opening file:', filename)
            onDismiss()
          }}
          onDismiss={onDismiss}
        />
      ),
      position: 'bottom',
      duration: 5000,
      dismissOnPress: false,
      backgroundColor: '#2196f3',
    })
  },

  // Show upload progress
  showUploadProgress: () => {
    let progress = 0
    const toastId = Toast.show({
      message: '',
      customView: <UploadProgressToast progress={0} filename="document.pdf" />,
      position: 'top',
      duration: 999999,
      dismissOnPress: false,
    })

    // Simulate upload progress
    const interval = setInterval(() => {
      progress += 0.1
      if (progress >= 1) {
        clearInterval(interval)
        Toast.hide(toastId)
        Toast.success('Upload complete!')
      } else {
        Toast.update(toastId, {
          customView: <UploadProgressToast progress={progress} filename="document.pdf" />,
        })
      }
    }, 500)
  },

  // Show rating request
  showRatingToast: () => {
    Toast.show({
      message: '',
      customView: ({ onDismiss }) => (
        <View style={styles.ratingToast}>
          <Text style={styles.ratingTitle}>Enjoying the app?</Text>
          <Text style={styles.ratingMessage}>Would you mind rating us on the App Store?</Text>
          <View style={styles.ratingStars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => {
                  console.log(`Rated ${star} stars`)
                  onDismiss()
                }}
              >
                <Text style={styles.star}>⭐</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ),
      position: 'center',
      duration: 10000,
      backgroundColor: '#fff',
      dismissOnPress: false,
    })
  },
}

const styles = StyleSheet.create({
  // Profile toast styles
  profileToast: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  profileContent: {
    flex: 1,
  },
  profileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  profileMessage: {
    fontSize: 12,
    color: '#666',
  },

  // Download toast styles
  downloadToast: {
    padding: 16,
  },
  downloadContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  downloadIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  downloadText: {
    flex: 1,
  },
  downloadTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  downloadFilename: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  downloadActions: {
    flexDirection: 'row',
    gap: 8,
  },
  downloadButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: '#2196f3',
    fontWeight: '600',
  },
  dismissButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  dismissButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  // Upload toast styles
  uploadToast: {
    padding: 16,
  },
  uploadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  uploadIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
  },
  progressText: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },

  // Rating toast styles
  ratingToast: {
    padding: 20,
    alignItems: 'center',
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  ratingMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 8,
  },
  star: {
    fontSize: 24,
  },
})
