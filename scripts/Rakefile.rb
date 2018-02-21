require 'open-uri'
require 'json'
require 'net/https'
require 'uri'

desc "Get subtitles URLs for brand"
task :get_subtitles_urls_for_brand do
  ARGV.each { |a| task a.to_sym do ; end }

  if !ENV['PEM_FILE']
    puts "Please export a PEM_FILE location, eg:"
    puts "export PEM_FILE=/path/to/your/dev-cert.pem"
    exit
  end

  brand_pid = ARGV[1]

  ibl = JSON.parse(open("http://ibl.api.bbci.co.uk/ibl/v1/programmes/#{brand_pid}/episodes?per_page=100").read)

  results = []

  ibl['programme_episodes']['elements'].each do |episode|
    epid = episode['id']
    title = episode['title'] + ' - ' + episode['subtitle']
    version = episode['versions'].first
    vpid = version['id']
    puts vpid
    subtitles_url = get_subtitles_url_for_vpid(vpid)

    if subtitles_url
      puts subtitles_url
      results << {
        'version_pid': vpid,
        'episode_pid': epid,
        'title': title,
        'subtitles_url': subtitles_url
      }
    end
  end

  File.open("subtitles-#{brand_pid}.json", 'w') do |f|
    f.write({'brand_pid': brand_pid, 'episodes': results}.to_json)
  end

end

def get_subtitles_url_for_vpid(vpid)
  pem = File.read(ENV['PEM_FILE'])

  uri = URI("https://api.live.bbc.co.uk/pips/api/v1/version/pid.#{vpid}/media_assets?rows=50")
  request = Net::HTTP.new(uri.host, uri.port)
  request.use_ssl = true
  request.cert = OpenSSL::X509::Certificate.new(pem)
  request.key = OpenSSL::PKey::RSA.new(pem)
  request.verify_mode = OpenSSL::SSL::VERIFY_PEER

  response = request.get(uri)

  matches = /ng\/modav\/\w+\.xml/.match(response.body)
  return "http://www.bbc.co.uk/iplayer/subtitles/#{matches[0]}" if matches
end