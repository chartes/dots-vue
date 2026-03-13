import { getMetadataFromApi } from '@/api/document.js'
import { useMetadataProcessor } from '@/composables/useMetadataProcessor.js'

export default async function fetchMetadata(
  sourceComp,
  resourceId,
  documentType,
  collConfig,
  route
) {
  const startTimefetchMetadata = new Date()

  //const { processMetadata } = useMetadataProcessor()

  const listmetadata =
    documentType === 'Resource'
      ? await getMetadataFromApi(resourceId, collConfig, route)
      : await getMetadataFromApi(resourceId, collConfig, route)

  console.log('fetchMetadata listmetadata : ', listmetadata)

  //const metadata = processMetadata(listmetadata, collConfig, resourceId, route)

  const endTimefetchMetadata = new Date()
  console.log(
    'fetchMetadata metadata TimeBuild Meta : ',
    endTimefetchMetadata - startTimefetchMetadata
  )
  console.log('fetchMetadata metadata final : ', listmetadata)

  return listmetadata
}