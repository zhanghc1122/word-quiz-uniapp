const DEFAULT_EDITION = 'pep'

export function getEdition() {
  return uni.getStorageSync('currentEdition') || DEFAULT_EDITION
}

export function setEdition(edition) {
  uni.setStorageSync('currentEdition', edition)
}

export function getEditionGrade() {
  return {
    edition: getEdition(),
    grade: uni.getStorageSync('currentGrade') || 3,
  }
}